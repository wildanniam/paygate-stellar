export const DEFAULT_JSON_BODY_LIMIT_BYTES = 64 * 1024;

export class RequestBodyTooLargeError extends Error {
  constructor(limitBytes = DEFAULT_JSON_BODY_LIMIT_BYTES) {
    super(`Request body exceeds ${limitBytes} bytes`);
    this.name = 'RequestBodyTooLargeError';
    this.statusCode = 413;
  }
}

export function isRequestBodyTooLarge(error) {
  return error instanceof RequestBodyTooLargeError || error?.statusCode === 413;
}

export function jsonBodyErrorResponse(error) {
  if (isRequestBodyTooLarge(error)) {
    return {
      statusCode: 413,
      payload: { error: 'Request body too large' },
    };
  }

  return {
    statusCode: 400,
    payload: { error: 'Invalid JSON body' },
  };
}

export async function readJsonBody(req, { maxBytes = DEFAULT_JSON_BODY_LIMIT_BYTES } = {}) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > maxBytes) throw new RequestBodyTooLargeError(maxBytes);
    return JSON.parse(req.body);
  }

  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > maxBytes) throw new RequestBodyTooLargeError(maxBytes);
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
