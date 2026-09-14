import { advanceFlow, createFlowPoint, fitMedia, flowResolution } from './pointerFlow.js';

const VERTEX = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D u_media;
uniform vec2 u_size;
uniform vec2 u_scale;
uniform vec2 u_offset;
uniform vec2 u_pointer;
uniform vec2 u_drag;
uniform float u_energy;
uniform float u_radius;
uniform float u_strength;
uniform float u_light;
uniform float u_vertical;
varying vec2 v_uv;
void main() {
  vec2 position = v_uv * u_size;
  vec2 delta = position - u_pointer;
  float distance = length(delta);
  float influence = exp(-dot(delta, delta) / (u_radius * u_radius));
  // The directional wake is local and vanishes as the pointer comes to rest.
  vec2 wake = u_drag * influence * u_strength;
  vec2 curl = vec2(-delta.y, delta.x) / max(distance, 1.0);
  wake += curl * sin(distance / u_radius * 3.14) * influence * u_energy * u_strength * 0.12;
  wake.y *= u_vertical;
  vec2 warped = v_uv - wake / u_size;
  vec2 uv = warped * u_scale + u_offset;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
  } else {
    vec4 color = texture2D(u_media, uv);
    // Lift only existing fibers/highlights; never draw a detached cursor spotlight.
    color.rgb *= 1.0 + influence * u_energy * u_light;
    gl_FragColor = color;
  }
}`;

const EXCLUDED = 'button,a,input,textarea,select,[role="tab"],[role="tablist"],.pr-receipt-area,.sj-object,.tx-endpoint,.lp-hero-copy';

/** One texture plane, no geometry scene. Returns complete listener/GPU cleanup. */
export function mountPointerFlow(canvas, mediaHost, eventHost, profile) {
  let gl;
  let program;
  let vertex;
  let fragment;
  let buffer;
  let texture;
  let frame = 0;
  let videoFrame = 0;
  let observedVideo = null;
  let stopped = false;
  let failed = false;
  let size = { width: 1, height: 1 };
  let resizeDirty = true;
  let rectDirty = true;
  let rect;
  let source = null;
  let sourceKey = '';
  let videoDirty = true;
  let lastVideoTime = -1;
  let lastTick = 0;
  let hasPointer = false;
  let position = [0.5, 0.5];
  let fit = 'cover';
  const point = createFlowPoint();
  const target = { x: 0, y: 0 };
  let uniforms;
  let observer;

  function fallback(reason = 'context-lost') {
    failed = true;
    canvas.dataset.flowState = 'fallback';
    canvas.dataset.flowReason = reason;
    cancelAnimationFrame(frame);
    frame = 0;
    if (videoFrame) observedVideo?.cancelVideoFrameCallback(videoFrame);
    videoFrame = 0;
  }

  function compile(type, text) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const reason = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader: ${reason}`);
    }
    return shader;
  }

  function wake() {
    if (!frame && !stopped && !failed) frame = requestAnimationFrame(draw);
  }

  function watchVideo() {
    const video = mediaHost.querySelector('video');
    if (video === observedVideo) return;
    if (videoFrame) observedVideo?.cancelVideoFrameCallback(videoFrame);
    observedVideo = video;
    videoFrame = 0;
    function freshFrame() {
      if (stopped || failed) return;
      videoDirty = true;
      wake();
      videoFrame = video.requestVideoFrameCallback(freshFrame);
    }
    if (video?.requestVideoFrameCallback) videoFrame = video.requestVideoFrameCallback(freshFrame);
  }

  function ready() { watchVideo(); videoDirty = true; wake(); }
  function resize() { resizeDirty = true; rectDirty = true; wake(); }
  function scrolled() { rectDirty = true; leave(); }
  function leave() {
    hasPointer = false;
    target.x = point.x;
    target.y = point.y;
    wake();
  }
  function move(event) {
    if (event.pointerType === 'touch' || event.target.closest?.(EXCLUDED)) { leave(); return; }
    if (rectDirty) { rect = canvas.getBoundingClientRect(); rectDirty = false; }
    const x = (event.clientX - rect.left) / rect.width * size.width;
    const y = (event.clientY - rect.top) / rect.height * size.height;
    if (!hasPointer) {
      point.x = x;
      point.y = y;
      point.energy = 0.3;
      hasPointer = true;
    }
    target.x = x;
    target.y = y;
    wake();
  }

  function draw(now) {
    frame = 0;
    if (stopped || failed) return;
    try {
      watchVideo();
      const video = observedVideo;
      const image = mediaHost.querySelector('img');
      const next = video && video.readyState >= 2 && !video.paused && !video.error ? video : image?.complete && image.naturalWidth ? image : null;
      if (!next) return; // Media events will wake us; keep the original poster visible.
      const key = next.currentSrc || next.src;
      const changed = next !== source || key !== sourceKey;
      if (changed || resizeDirty) {
        source = next;
        sourceKey = key;
        const style = getComputedStyle(next);
        fit = style.objectFit;
        position = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
        size = { width: canvas.clientWidth, height: canvas.clientHeight };
        if (!size.width || !size.height) return;
        const [width, height] = flowResolution(size.width, size.height, window.devicePixelRatio);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        gl.viewport(0, 0, width, height);
        const mapping = fitMedia(size.width, size.height, next.videoWidth || next.naturalWidth, next.videoHeight || next.naturalHeight, fit, position);
        gl.uniform2f(uniforms.u_size, size.width, size.height);
        gl.uniform2fv(uniforms.u_scale, mapping.scale);
        gl.uniform2fv(uniforms.u_offset, mapping.offset);
        resizeDirty = false;
      }
      const seconds = lastTick ? (now - lastTick) / 1000 : 1 / 60;
      lastTick = now;
      const moving = advanceFlow(point, target, seconds);
      const isVideo = next === video;
      if (changed || (isVideo && (videoDirty || (!video.requestVideoFrameCallback && video.currentTime !== lastVideoTime)))) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, next);
        videoDirty = false;
        lastVideoTime = isVideo ? video.currentTime : -1;
      }
      gl.uniform2f(uniforms.u_pointer, point.x, point.y);
      gl.uniform2f(uniforms.u_drag, point.dx, point.dy);
      gl.uniform1f(uniforms.u_energy, point.energy);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (canvas.dataset.flowState !== 'ready') {
        if (gl.getError() !== gl.NO_ERROR) { fallback(); return; }
        canvas.dataset.flowState = 'ready';
      }
      canvas.dataset.flowEnergy = point.energy.toFixed(3);
      if (moving || (isVideo && !video.requestVideoFrameCallback)) wake();
    } catch (error) { fallback(error.message); }
  }

  function lost(event) { event.preventDefault(); fallback(); }

  function dispose() {
    stopped = true;
    cancelAnimationFrame(frame);
    if (videoFrame) observedVideo?.cancelVideoFrameCallback(videoFrame);
    observer?.disconnect();
    eventHost.removeEventListener('pointermove', move);
    eventHost.removeEventListener('pointerleave', leave);
    eventHost.removeEventListener('pointercancel', leave);
    window.removeEventListener('scroll', scrolled, true);
    window.removeEventListener('resize', resize);
    for (const event of ['load', 'loadeddata', 'playing', 'error']) mediaHost.removeEventListener(event, ready, true);
    canvas.removeEventListener('webglcontextlost', lost);
    canvas.dataset.flowState = 'inactive';
    if (gl) {
      if (texture) gl.deleteTexture(texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      // React StrictMode replays effects on this canvas. Delete resources without
      // deliberately losing its context; the browser reclaims detached canvases.
    }
  }

  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
    if (!gl) { fallback('context-unavailable'); return dispose; }
    vertex = compile(gl.VERTEX_SHADER, VERTEX);
    fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Pointer flow program unavailable');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    uniforms = Object.fromEntries(['u_size','u_scale','u_offset','u_pointer','u_drag','u_energy','u_radius','u_strength','u_light','u_vertical'].map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform1i(gl.getUniformLocation(program, 'u_media'), 0);
    gl.uniform1f(uniforms.u_radius, profile.radius);
    gl.uniform1f(uniforms.u_strength, profile.strength);
    gl.uniform1f(uniforms.u_light, profile.light);
    gl.uniform1f(uniforms.u_vertical, profile.vertical);
    canvas.addEventListener('webglcontextlost', lost);
    eventHost.addEventListener('pointermove', move, { passive: true });
    eventHost.addEventListener('pointerleave', leave);
    eventHost.addEventListener('pointercancel', leave);
    window.addEventListener('scroll', scrolled, { passive: true, capture: true });
    window.addEventListener('resize', resize, { passive: true });
    for (const event of ['load', 'loadeddata', 'playing', 'error']) mediaHost.addEventListener(event, ready, true);
    observer = new ResizeObserver(resize);
    observer.observe(mediaHost);
    wake();
  } catch (error) { fallback(error.message); }
  return dispose;
}
