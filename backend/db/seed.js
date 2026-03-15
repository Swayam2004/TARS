import { getDb } from './database.js';
import { v4 as uuidv4 } from 'uuid';

const db = getDb();

const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

function seed() {
  const existing = db.prepare('SELECT COUNT(*) as cnt FROM runbooks').get();
  if (existing.cnt > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding TARS database...');

  // ── Documents ──────────────────────────────────────────────────────────────
  const docs = [
    { id: 'd-001', filename: 'Database_Failover_Procedure.pdf',   format: 'pdf',  upload_date: daysAgo(14) },
    { id: 'd-002', filename: 'Kubernetes_Pod_Restart_Runbook.pdf', format: 'pdf',  upload_date: daysAgo(10) },
    { id: 'd-003', filename: 'SSL_Certificate_Renewal.docx',       format: 'docx', upload_date: daysAgo(6)  },
    { id: 'd-004', filename: 'Incident_Response_Guide_v3.pdf',     format: 'pdf',  upload_date: daysAgo(2)  },
  ];
  const insertDoc = db.prepare(
    `INSERT OR IGNORE INTO documents (id, filename, format, upload_date, user_id)
     VALUES (@id, @filename, @format, @upload_date, 'demo-user')`
  );
  docs.forEach(d => insertDoc.run(d));

  // ── Runbooks ───────────────────────────────────────────────────────────────
  const runbooks = [
    {
      id: 'rb-001', name: 'Database Failover — PostgreSQL Primary',
      status: 'APPROVED', source_doc_id: 'd-001', created_at: daysAgo(14), version: 2,
      steps_json: JSON.stringify([
        { id: 's1', order: 1,  type: 'ASSERT',  description: 'Verify primary DB health',           cmd: 'pg_isready -h primary-db -U postgres',                         requires_approval: false, params: ['primary-db'] },
        { id: 's2', order: 2,  type: 'COMMAND', description: 'Stop application write traffic',     cmd: 'kubectl scale deployment app --replicas=0 -n production',       requires_approval: true,  params: ['production'] },
        { id: 's3', order: 3,  type: 'ASSERT',  description: 'Confirm replica lag is zero',        cmd: "psql -c 'SELECT pg_last_wal_receive_lsn() = pg_last_wal_replay_lsn()'", requires_approval: false, params: [] },
        { id: 's4', order: 4,  type: 'COMMAND', description: 'Promote replica to primary',         cmd: "pg_ctl promote -D /var/lib/postgresql/data",                    requires_approval: true,  params: [] },
        { id: 's5', order: 5,  type: 'ASSERT',  description: 'Verify new primary accepts writes',  cmd: "psql -h replica-db -c 'SELECT pg_is_in_recovery()'",            requires_approval: false, params: ['replica-db'] },
        { id: 's6', order: 6,  type: 'COMMAND', description: 'Update connection pool config',      cmd: 'kubectl set env deployment/pgbouncer DB_HOST=replica-db',       requires_approval: false, params: ['replica-db'] },
        { id: 's7', order: 7,  type: 'COMMAND', description: 'Scale application back up',          cmd: 'kubectl scale deployment app --replicas=3 -n production',       requires_approval: false, params: ['production'] },
        { id: 's8', order: 8,  type: 'ASSERT',  description: 'Run smoke tests against new primary', cmd: 'npm run test:smoke -- --env production',                        requires_approval: false, params: ['production'] },
      ]),
      dag_json:    JSON.stringify({ edges: [['s1','s2'],['s2','s3'],['s3','s4'],['s4','s5'],['s5','s6'],['s6','s7'],['s7','s8']] }),
      params_json: JSON.stringify({ primary_db: 'primary-db.prod.internal', replica_db: 'replica-db.prod.internal', namespace: 'production' }),
    },
    {
      id: 'rb-002', name: 'Kubernetes Pod Restart — Zero Downtime',
      status: 'APPROVED', source_doc_id: 'd-002', created_at: daysAgo(10), version: 1,
      steps_json: JSON.stringify([
        { id: 's1', order: 1, type: 'ASSERT',  description: 'Check pod status', cmd: 'kubectl get pods -n {namespace} -l app={app_name}', requires_approval: false, params: ['namespace', 'app_name'] },
        { id: 's2', order: 2, type: 'COMMAND', description: 'Cordon node',      cmd: 'kubectl cordon {node_name}',                         requires_approval: true,  params: ['node_name'] },
        { id: 's3', order: 3, type: 'COMMAND', description: 'Rolling restart',  cmd: 'kubectl rollout restart deployment/{app_name}',       requires_approval: false, params: ['app_name'] },
        { id: 's4', order: 4, type: 'ASSERT',  description: 'Verify rollout',   cmd: 'kubectl rollout status deployment/{app_name}',        requires_approval: false, params: ['app_name'] },
        { id: 's5', order: 5, type: 'COMMAND', description: 'Uncordon node',    cmd: 'kubectl uncordon {node_name}',                        requires_approval: false, params: ['node_name'] },
      ]),
      dag_json:    JSON.stringify({ edges: [['s1','s2'],['s2','s3'],['s3','s4'],['s4','s5']] }),
      params_json: JSON.stringify({ namespace: 'default', app_name: 'web-api', node_name: 'node-01' }),
    },
    {
      id: 'rb-003', name: 'SSL Certificate Renewal — Nginx',
      status: 'VALIDATED', source_doc_id: 'd-003', created_at: daysAgo(6), version: 1,
      steps_json: JSON.stringify([
        { id: 's1', order: 1, type: 'ASSERT',  description: 'Check cert expiry', cmd: "openssl s_client -connect {domain}:443 | openssl x509 -noout -dates", requires_approval: false, params: ['domain'] },
        { id: 's2', order: 2, type: 'COMMAND', description: 'Renew via certbot', cmd: 'certbot renew --nginx -d {domain}',                                   requires_approval: true,  params: ['domain'] },
        { id: 's3', order: 3, type: 'COMMAND', description: 'Reload nginx',      cmd: 'systemctl reload nginx',                                               requires_approval: false, params: [] },
        { id: 's4', order: 4, type: 'ASSERT',  description: 'Verify new cert',   cmd: "openssl s_client -connect {domain}:443 | openssl x509 -noout -dates", requires_approval: false, params: ['domain'] },
      ]),
      dag_json:    JSON.stringify({ edges: [['s1','s2'],['s2','s3'],['s3','s4']] }),
      params_json: JSON.stringify({ domain: 'api.acme.com' }),
    },
    {
      id: 'rb-004', name: 'Incident Response — Service Degradation',
      status: 'DRAFT', source_doc_id: 'd-004', created_at: daysAgo(2), version: 1,
      steps_json: JSON.stringify([
        { id: 's1', order: 1, type: 'ASSERT',  description: 'Pull Datadog metrics',  cmd: 'datadog metrics query avg:system.cpu.user{*} last 15m', requires_approval: false, params: [] },
        { id: 's2', order: 2, type: 'DECISION',description: 'CPU > 90%?',            cmd: 'IF cpu_usage > 90 THEN scale_up ELSE investigate_logs',  requires_approval: false, params: [] },
        { id: 's3', order: 3, type: 'COMMAND', description: 'Scale up replicas',     cmd: 'kubectl scale deployment {service} --replicas={n}',      requires_approval: true,  params: ['service', 'n'] },
        { id: 's4', order: 4, type: 'ASSERT',  description: 'Verify CPU normalised', cmd: 'datadog metrics query avg:system.cpu.user{*} last 5m',   requires_approval: false, params: [] },
      ]),
      dag_json:    JSON.stringify({ edges: [['s1','s2'],['s2','s3'],['s3','s4']] }),
      params_json: JSON.stringify({ service: 'api-gateway', n: 5 }),
    },
  ];
  const insertRb = db.prepare(
    `INSERT OR IGNORE INTO runbooks (id, name, status, source_doc_id, created_at, version, steps_json, dag_json, params_json)
     VALUES (@id, @name, @status, @source_doc_id, @created_at, @version, @steps_json, @dag_json, @params_json)`
  );
  runbooks.forEach(r => insertRb.run(r));

  // ── Execution Runs ─────────────────────────────────────────────────────────
  const runs = [
    { id: 'run-001', runbook_id: 'rb-001', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'alice@deloitte.com',  started_at: daysAgo(12), completed_at: daysAgo(12) },
    { id: 'run-002', runbook_id: 'rb-001', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'bob@deloitte.com',    started_at: daysAgo(10), completed_at: daysAgo(10) },
    { id: 'run-003', runbook_id: 'rb-001', status: 'FAILED',   mode: 'dry-run', triggered_by: 'alice@deloitte.com',  started_at: daysAgo(8),  completed_at: daysAgo(8)  },
    { id: 'run-004', runbook_id: 'rb-002', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'carol@deloitte.com',  started_at: daysAgo(9),  completed_at: daysAgo(9)  },
    { id: 'run-005', runbook_id: 'rb-002', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'carol@deloitte.com',  started_at: daysAgo(7),  completed_at: daysAgo(7)  },
    { id: 'run-006', runbook_id: 'rb-002', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'bob@deloitte.com',    started_at: daysAgo(5),  completed_at: daysAgo(5)  },
    { id: 'run-007', runbook_id: 'rb-003', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'dave@deloitte.com',   started_at: daysAgo(4),  completed_at: daysAgo(4)  },
    { id: 'run-008', runbook_id: 'rb-001', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'alice@deloitte.com',  started_at: daysAgo(3),  completed_at: daysAgo(3)  },
    { id: 'run-009', runbook_id: 'rb-002', status: 'SUCCESS',  mode: 'dry-run', triggered_by: 'carol@deloitte.com',  started_at: daysAgo(2),  completed_at: daysAgo(2)  },
    { id: 'run-010', runbook_id: 'rb-003', status: 'FAILED',   mode: 'dry-run', triggered_by: 'dave@deloitte.com',   started_at: daysAgo(1),  completed_at: daysAgo(1)  },
  ];
  const insertRun = db.prepare(
    `INSERT OR IGNORE INTO execution_runs (id, runbook_id, status, mode, triggered_by, started_at, completed_at)
     VALUES (@id, @runbook_id, @status, @mode, @triggered_by, @started_at, @completed_at)`
  );
  runs.forEach(r => insertRun.run(r));

  // ── Knowledge Entries ──────────────────────────────────────────────────────
  const knowledge = [
    { id: 'kb-001', runbook_id: 'rb-001', success_count: 3, failure_count: 1, avg_duration: 142.5, last_run_at: daysAgo(3) },
    { id: 'kb-002', runbook_id: 'rb-002', success_count: 3, failure_count: 0, avg_duration: 67.2,  last_run_at: daysAgo(2) },
    { id: 'kb-003', runbook_id: 'rb-003', success_count: 1, failure_count: 1, avg_duration: 38.8,  last_run_at: daysAgo(1) },
  ];
  const insertKb = db.prepare(
    `INSERT OR IGNORE INTO knowledge_entries (id, runbook_id, success_count, failure_count, avg_duration, last_run_at)
     VALUES (@id, @runbook_id, @success_count, @failure_count, @avg_duration, @last_run_at)`
  );
  knowledge.forEach(k => insertKb.run(k));

  console.log('Seed complete. Database ready.');
}

seed();
