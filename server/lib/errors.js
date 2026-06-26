export function publicErrorMessage(error, fallback = 'PayGate could not complete the request.') {
  const raw = error instanceof Error ? error.message : String(error || '');
  const message = raw.trim();
  if (!message) return fallback;

  const looksLikeHtml = /<(!doctype|html|head|body|div|span|meta|script)\b/i.test(message);
  const looksLikeGatewayError = /cloudflare|connection timed out|error code 52\d|supabase\.co/i.test(message);

  if (looksLikeHtml || looksLikeGatewayError || message.length > 320) {
    return fallback;
  }

  return message;
}
