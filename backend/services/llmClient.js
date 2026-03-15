import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const openai   = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Call LLM with automatic fallback: OpenAI GPT-4o → Anthropic Claude
 * Always returns a parsed JS object (JSON mode enforced on both providers).
 */
export async function callLLM(prompt, systemPrompt, { temperature = 0.2, maxTokens = 4096 } = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0].message.content;
    return JSON.parse(raw);

  } catch (err) {
    console.warn(`[LLM] OpenAI failed (${err.message}), falling back to Claude…`);

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: `${systemPrompt}\n\nIMPORTANT: Respond with valid JSON only — no markdown fences, no preamble.\n\n${prompt}`,
      }],
    });

    const text = msg.content[0].text.trim();
    // Strip accidental ```json fences if Claude adds them
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    return JSON.parse(clean);
  }
}

/**
 * Streaming variant — yields text chunks via an async generator.
 * Used by the SSE pipeline for real-time agent log output.
 */
export async function* streamLLM(prompt, systemPrompt) {
  try {
    const stream = openai.beta.chat.completions.stream({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.2,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }

  } catch (err) {
    console.warn(`[LLM Stream] OpenAI failed, falling back to Claude stream…`);

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: `${systemPrompt}\n\n${prompt}` }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        yield event.delta.text;
      }
    }
  }
}
