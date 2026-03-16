import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create required directories before anything else loads
mkdirSync(join(__dirname, '../data'),    { recursive: true });
mkdirSync(join(__dirname, 'uploads'),   { recursive: true });

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db/database.js';
import { seed } from './db/seed.js';

import documentsRouter  from './routes/documents.js';
import runbooksRouter   from './routes/runbooks.js';
import validationRouter from './routes/validation.js';
import executionRouter  from './routes/execution.js';
import analyticsRouter  from './routes/analytics.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Init DB on startup ─────────────────────────────────────────────────────
getDb();
seed();

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
