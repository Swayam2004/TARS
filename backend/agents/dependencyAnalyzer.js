import { callLLM } from '../services/llmClient.js';

const SYSTEM_PROMPT = `You are a workflow dependency analyst.
Given a list of runbook steps, identify execution dependencies and build a DAG (directed acyclic graph).

DEPENDENCY RULES:
- By default, steps run sequentially: s1 → s2 → s3
- Steps are PARALLEL if they operate on completely independent resources with no shared state
- A step DEPENDS ON another if it needs its output, or if its target resource was modified by the prior step
- ASSERT steps always depend on the COMMAND step they verify
- DECISION steps depend on whatever they evaluate

OUTPUT: Valid JSON only — no markdown, no preamble.
{
  "edges": [["s1", "s2"], ["s2", "s3"]],
  "parallel_groups": [["s3", "s4"]],
  "critical_path": ["s1", "s2", "s4", "s6"],
  "estimated_total_seconds": 240
}`;

/**
 * Agent 2 — Dependency Analyzer
 * Takes extracted steps and returns a DAG of dependencies.
 */
export async function analyzeDependencies(steps) {
  const stepSummaries = steps.map(s =>
    `${s.id} [${s.type}]: "${s.description}" — cmd: ${s.cmd || 'N/A'}`
  ).join('\n');

  const prompt = `Analyze these ${steps.length} runbook steps and identify execution dependencies:

${stepSummaries}

Return JSON with: edges (array of [from, to] pairs), parallel_groups (array of step-id arrays that can run together), critical_path (ordered array of step ids on the longest path), estimated_total_seconds.`;

  const result = await callLLM(prompt, SYSTEM_PROMPT, { temperature: 0.1, maxTokens: 1024 });

  // Guarantee edges array exists
  if (!result.edges) {
    result.edges = steps.slice(0, -1).map((s, i) => [s.id, steps[i + 1].id]);
  }

  return result;
}
