import { callLLM } from '../services/llmClient.js';

const SYSTEM_PROMPT = `You are a runbook parameter analyst.
Extract all input parameters that a user must supply before executing this runbook.

PARAMETER TYPES:
- string: hostnames, usernames, paths, names
- number: replica counts, timeouts, port numbers
- enum: environment names (production/staging/dev), modes
- secret: passwords, tokens, keys (mark as sensitive=true)

OUTPUT: Valid JSON only — no markdown.
{
  "params": [
    {
      "name": "namespace",
      "type": "string",
      "description": "Kubernetes namespace to target",
      "default": "default",
      "required": true,
      "sensitive": false,
      "example": "production"
    }
  ]
}`;

/**
 * Agent 3 — Parameter Mapper
 * Scans all step commands for {placeholder} tokens and produces a typed parameter manifest.
 */
export async function mapParameters(steps, runbookName) {
  // First do a quick regex pass to find all {placeholders}
  const allCmds = steps.map(s => s.cmd || '').join('\n');
  const placeholders = [...new Set(allCmds.match(/\{([^}]+)\}/g) || [])];

  if (placeholders.length === 0) {
    return { params: [] };
  }

  const prompt = `Runbook: "${runbookName}"

Found these parameter placeholders in the steps:
${placeholders.join(', ')}

Step commands for context:
${steps.map(s => `  ${s.id}: ${s.cmd || ''}`).join('\n')}

For each placeholder, generate a typed parameter definition. Return JSON with key: params[].
Each param needs: name, type, description, default (or null), required, sensitive, example.`;

  return callLLM(prompt, SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 1024 });
}
