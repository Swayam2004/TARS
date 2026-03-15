import { callLLM } from '../services/llmClient.js';

const SYSTEM_PROMPT = `You are an expert operational runbook analyst at a Fortune 500 company.
Your task is to extract structured, executable steps from operational procedure documents.

STEP TYPES:
- COMMAND: An executable shell command, API call, or system operation
- ASSERT: A verification or health check that must pass before proceeding
- DECISION: A conditional branch point (IF condition THEN action)
- WAIT: A pause, delay, or manual checkpoint

EXTRACTION RULES:
1. Maintain the original sequence — order matters
2. Each step must be atomic and independently executable
3. Extract ALL parameters as {placeholder} tokens (e.g. {server_name}, {namespace})
4. requires_approval=true only for steps that modify production state (no rollback possible)
5. Ignore boilerplate: introductions, author info, change history, references
6. Infer step type from the verb: "verify/check/confirm/ensure" → ASSERT, "run/execute/restart/deploy" → COMMAND

OUTPUT: Valid JSON only — no markdown, no preamble.

EXAMPLE INPUT: "1. Stop the nginx service: sudo systemctl stop nginx"
EXAMPLE OUTPUT:
{
  "steps": [
    {
      "id": "s1",
      "order": 1,
      "type": "COMMAND",
      "description": "Stop nginx service",
      "cmd": "sudo systemctl stop nginx",
      "requires_approval": false,
      "params": [],
      "estimated_duration_seconds": 5
    }
  ],
  "runbook_name": "Nginx Service Management",
  "summary": "Procedure to stop and restart nginx"
}`;

/**
 * Agent 1 — Step Extractor
 * Takes raw document text and extracts ordered, typed steps via LLM.
 */
export async function extractSteps(rawText, filename) {
  const prompt = `DOCUMENT: "${filename}"

CONTENT:
---
${rawText.slice(0, 12000)}
---

Extract all executable steps. Return JSON with keys: steps[], runbook_name, summary.
Each step must have: id (s1, s2...), order, type, description, cmd, requires_approval, params[], estimated_duration_seconds.`;

  const result = await callLLM(prompt, SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 4096 });

  // Normalise IDs to ensure they are sequential
  if (result.steps) {
    result.steps = result.steps.map((s, i) => ({
      ...s,
      id: s.id || `s${i + 1}`,
      order: s.order || i + 1,
    }));
  }

  return result;
}
