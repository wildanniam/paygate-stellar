import { Keypair } from '@stellar/stellar-sdk';
import { Mppx } from 'mppx/client';
import { stellar } from '@stellar/mpp/charge/client';
import 'dotenv/config';

const STELLAR_SECRET = process.env.STELLAR_SECRET;
const SAMPLE_URL = process.env.PAYGATE_SAMPLE_URL || 'http://localhost:4000/v1/market-signal';

if (!STELLAR_SECRET) {
  throw new Error('[PayGate Demo] STELLAR_SECRET env var is not set. Add payer testnet secret key to .env.');
}

const keypair = Keypair.fromSecret(STELLAR_SECRET);

console.log(`[PayGate Demo] Agent payer: ${keypair.publicKey()}`);
console.log(`[PayGate Demo] Requesting paid API: ${SAMPLE_URL}`);

Mppx.create({
  methods: [
    stellar.charge({
      keypair,
      mode: 'pull',
      onProgress(event) {
        console.log(`[PayGate Demo] ${event.type}`, event);
      },
    }),
  ],
});

const response = await fetch(SAMPLE_URL);
const bodyText = await response.text();

let body;
try {
  body = JSON.parse(bodyText);
} catch {
  body = bodyText;
}

console.log(`[PayGate Demo] Response status: ${response.status}`);
console.log('[PayGate Demo] Response body:', body);

if (!response.ok) {
  throw new Error(`[PayGate Demo] Paid request failed with HTTP ${response.status}`);
}
