import { useEffect, useRef } from 'react';
import { useTarsStore } from '../../store/useTarsStore';

/**
 * Connects to the SSE synthesis pipeline for a given docId.
 * Dispatches events into Zustand store in real time.
 */
export function useSSEPipeline(docId, { onComplete } = {}) {
  const esRef = useRef(null);
  const { setAgentStatus, appendAgentLog, setSynthesisComplete, setCurrentRunbookId } = useTarsStore();

  useEffect(() => {
    if (!docId) return;

    const es = new EventSource(`/api/documents/${docId}/synthesize`);
    esRef.current = es;

    es.addEventListener('agent_start', e => {
      const d = JSON.parse(e.data);
      setAgentStatus({ agent: d.agent, status: 'running', message: d.message });
    });

    es.addEventListener('agent_progress', e => {
      const d = JSON.parse(e.data);
      appendAgentLog({ agent: d.agent, message: d.message });
    });

    es.addEventListener('agent_complete', e => {
      const d = JSON.parse(e.data);
      setAgentStatus({ agent: d.agent, status: 'complete', message: d.message, data: d });
    });

    es.addEventListener('synthesis_complete', e => {
      const d = JSON.parse(e.data);
      setCurrentRunbookId(d.runbookId);
      setSynthesisComplete(d);
      onComplete?.(d);
      es.close();
    });

    es.addEventListener('error', e => {
      try {
        const d = JSON.parse(e.data);
        console.error('[SSE] Pipeline error:', d.message);
      } catch {}
      es.close();
    });

    es.onerror = () => es.close();

    return () => es.close();
  }, [docId]);

  return { cancel: () => esRef.current?.close() };
}
