import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db/database.js';

import documentsRouter  from './routes/documents.js';
import runbooksRouter   from './routes/runbooks.js';
import validationRouter from './routes/validation.js';
import executionRouter  from './routes/execution.js';
import analyticsRouter  from './routes/analytics.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Init DB on startup ─────────────────────────────────────────────────────
getDb();

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/documents',            documentsRouter);
app.use('/api/runbooks',             runbooksRouter);
app.use('/api/runbooks',             validationRouter);
app.use('/api/runbooks',             executionRouter);
app.use('/api/analytics',            analyticsRouter);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TARS backend running on http://localhost:${PORT}`);
  console.log(`   OpenAI key:    ${process.env.OPENAI_API_KEY     ? '✓ set' : '✗ missing'}`);
  console.log(`   Anthropic key: ${process.env.ANTHROPIC_API_KEY  ? '✓ set' : '✗ missing'}\n`);
});
