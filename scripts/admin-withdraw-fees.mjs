import { withdrawPlatformFees } from '../api/_lib/escrowContract.js';

try {
  const result = await withdrawPlatformFees();
  console.log('PayGate platform fee withdrawal submitted');
  console.log(`Amount: ${result.amountUsdc} USDC`);
  console.log(`Tx: ${result.txHash}`);
  console.log(`Explorer: https://stellar.expert/explorer/testnet/tx/${result.txHash}`);
} catch (error) {
  console.error(error.message || 'Platform fee withdrawal failed');
  process.exitCode = 1;
}
