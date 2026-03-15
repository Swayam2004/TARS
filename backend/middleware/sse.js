/**
 * Sets SSE headers and returns a typed emitter function.
 * Usage: const emit = sseInit(res);  emit('event_name', { data });
 */
export function sseInit(res) {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Heartbeat every 15s to prevent proxy timeouts
  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15000);
  res.on('close', () => clearInterval(heartbeat));

  return function emit(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
}
