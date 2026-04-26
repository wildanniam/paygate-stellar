export function generateIntegration({ path }) {
  return `// Tambahkan ke server.js kamu

import { paywall } from './mpp-middleware.js';

// SEBELUM:
// app.get('${path}', (req, res) => {
//   res.json({ data: '...' });
// });

// SESUDAH:
app.get('${path}', paywall, (req, res) => {
  // Handler kamu tidak perlu diubah - gunakan res.json() seperti biasa.
  res.json({ data: '...' });
});
`;
}

