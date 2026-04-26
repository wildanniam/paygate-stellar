import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import generateRoute from './routes/generate.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);
app.use('/api', generateRoute);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`PayGate backend running on port ${PORT}`);
});

