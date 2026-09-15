import { useEffect, useRef, useState } from 'react';
import { FLOW_PROFILES } from '../../lib/pointerFlow.js';
import { mountPointerFlow } from '../../lib/pointerFlowRenderer.js';
import '../../styles/pointer-flow.css';

function FlowCanvas({ profile, eventHostRef }) {
  const canvas = useRef(null);
  useEffect(() => {
    const node = canvas.current;
    const mediaHost = node.parentElement;
    return mountPointerFlow(node, mediaHost, eventHostRef?.current || mediaHost.parentElement, FLOW_PROFILES[profile]);
  }, [profile, eventHostRef]);
  return <canvas ref={canvas} className="pointer-flow" data-flow-profile={profile} data-flow-state="loading" aria-hidden="true" />;
}

/** Touch/narrow layouts and disabled motion keep the existing media, without a GPU context. */
export default function PointerFlow({ active, profile, eventHostRef }) {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 741px) and (hover: hover) and (pointer: fine)');
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return active && canHover && FLOW_PROFILES[profile] ? <FlowCanvas profile={profile} eventHostRef={eventHostRef} /> : null;
}
