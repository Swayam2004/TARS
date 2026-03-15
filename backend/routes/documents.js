import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../db/database.js';
import { ingest } from '../agents/ingestion.js';
import { extractSteps } from '../agents/stepExtractor.js';
import { analyzeDependencies } from '../agents/dependencyAnalyzer.js';
import { mapParameters } from '../agents/paramMapper.js';
import { sseInit } from '../middleware/sse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storage = multer.diskStorage({
  destination: join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/documents/upload — receive file, store metadata, return docId
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const db = getDb();
    const docId = `d-${uuidv4().slice(0, 8)}`;

    db.prepare(
      `INSERT INTO documents (id, filename, format, upload_date, file_path, user_id)
       VALUES (?, ?, ?, ?, ?, 'demo-user')`
    ).run(docId, req.file.originalname, req.file.originalname.split('.').pop(), new Date().toISOString(), req.file.path);

    res.json({ docId, filename: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:docId/synthesize — SSE stream of the 3-agent pipeline
router.get('/:docId/synthesize', async (req, res) => {
  const emit = sseInit(res);
  const db = getDb();

  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.docId);
    if (!doc) { emit('error', { message: 'Document not found' }); return res.end(); }

    // ── Agent 0: Ingestion ───────────────────────────────────────────────────
    emit('agent_start', { agent: 'ingestion', label: 'Ingestion Agent', message: 'Parsing document…' });
    const { rawText, metadata } = await ingest(doc.file_path, doc.filename);
    db.prepare('UPDATE documents SET raw_text = ? WHERE id = ?').run(rawText, doc.id);
    emit('agent_complete', {
      agent: 'ingestion',
      message: `Extracted ${metadata.wordCount.toLocaleString()} words from ${metadata.pages ?? '?'} page(s).`,
      metadata,
    });

    // ── Agent 1: Step Extractor ───────────────────────────────────────────────
    emit('agent_start', { agent: 'step_extractor', label: 'Step Extractor', message: 'Identifying steps with GPT-4o…' });
    const extracted = await extractSteps(rawText, doc.filename);
    const steps = extracted.steps || [];
    emit('agent_progress', { agent: 'step_extractor', message: `Found ${steps.length} executable steps.` });
    emit('agent_complete', {
      agent: 'step_extractor',
      message: `Extracted ${steps.length} steps. Runbook: "${extracted.runbook_name}"`,
      steps,
      runbook_name: extracted.runbook_name,
      summary: extracted.summary,
    });

    // ── Agent 2: Dependency Analyzer ─────────────────────────────────────────
    emit('agent_start', { agent: 'dependency_analyzer', label: 'Dependency Analyzer', message: 'Building execution DAG…' });
    const dag = await analyzeDependencies(steps);
    emit('agent_complete', {
      agent: 'dependency_analyzer',
      message: `Built DAG with ${dag.edges?.length ?? 0} edges. Critical path: ${dag.critical_path?.length ?? 0} steps.`,
      dag,
    });

    // ── Agent 3: Parameter Mapper ─────────────────────────────────────────────
    emit('agent_start', { agent: 'param_mapper', label: 'Parameter Mapper', message: 'Extracting input parameters…' });
    const paramResult = await mapParameters(steps, extracted.runbook_name || doc.filename);
    emit('agent_complete', {
      agent: 'param_mapper',
      message: `Mapped ${paramResult.params?.length ?? 0} parameter(s).`,
      params: paramResult.params,
    });

    // ── Assemble runbook ──────────────────────────────────────────────────────
    const rbId = `rb-${uuidv4().slice(0, 8)}`;
    db.prepare(
      `INSERT INTO runbooks (id, name, status, source_doc_id, created_at, version, steps_json, dag_json, params_json)
       VALUES (?, ?, 'DRAFT', ?, ?, 1, ?, ?, ?)`
    ).run(
      rbId,
      extracted.runbook_name || doc.filename.replace(/\.[^.]+$/, ''),
      doc.id,
      new Date().toISOString(),
      JSON.stringify(steps),
      JSON.stringify(dag),
      JSON.stringify(paramResult.params || [])
    );

    emit('synthesis_complete', {
      runbookId: rbId,
      runbookName: extracted.runbook_name,
      totalSteps: steps.length,
      status: 'DRAFT',
    });

    res.end();
  } catch (err) {
    console.error('[Synthesize]', err);
    emit('error', { message: err.message });
    res.end();
  }
});

// GET /api/documents — list all uploaded documents
router.get('/', (req, res) => {
  const db = getDb();
  const docs = db.prepare('SELECT id, filename, format, upload_date FROM documents ORDER BY upload_date DESC').all();
  res.json(docs);
});

export default router;
