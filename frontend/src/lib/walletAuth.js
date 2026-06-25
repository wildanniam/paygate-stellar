import { isConnected, requestAccess, signMessage } from '@stellar/freighter-api';

export const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015';

export async function readJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function isLocalhost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function apiErrorMessage(res, body, fallback) {
  if (body?.error) return body.error;
  const localHint = isLocalhost() && res.status >= 500
    ? ' Make sure the local API server is running on localhost:3001.'
    : '';
  return `${fallback}${localHint}`;
}

function normalizeSignedMessage(signedMessage) {
  if (typeof signedMessage === 'string') return signedMessage;
  if (signedMessage?.type === 'Buffer' && Array.isArray(signedMessage.data)) {
    return btoa(String.fromCharCode(...signedMessage.data));
  }
  if (signedMessage && typeof signedMessage.toString === 'function') {
    return signedMessage.toString('base64');
  }
  return '';
}

export async function connectFreighterWallet() {
  const connected = await isConnected();
  if (connected.error) throw new Error(connected.error.message || 'Freighter connection failed.');
  if (!connected.isConnected) {
    throw new Error('Freighter is not connected. Install or unlock Freighter, then try again.');
  }

  const access = await requestAccess();
  if (access.error) throw new Error(access.error.message || 'Wallet access was rejected.');
  const developerWallet = access.address;

  const challengeRes = await fetch('/api/auth/challenge', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: developerWallet }),
  });
  const challenge = await readJsonResponse(challengeRes);
  if (!challengeRes.ok) {
    throw new Error(apiErrorMessage(challengeRes, challenge, 'PayGate could not create a wallet login challenge.'));
  }

  const signed = await signMessage(challenge.message, {
    address: developerWallet,
    networkPassphrase: TESTNET_PASSPHRASE,
  });
  if (signed.error) throw new Error(signed.error.message || 'Signature request was rejected.');

  const signature = normalizeSignedMessage(signed.signedMessage);
  if (!signature) throw new Error('Freighter did not return a signature.');

  const verifyRes = await fetch('/api/auth/verify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: challenge.challengeId,
      walletAddress: developerWallet,
      signerAddress: signed.signerAddress,
      signedMessage: signature,
    }),
  });
  const verified = await readJsonResponse(verifyRes);
  if (!verifyRes.ok) {
    throw new Error(apiErrorMessage(verifyRes, verified, 'Wallet signature could not be verified.'));
  }

  return { authenticated: true, walletAddress: verified.walletAddress };
}
