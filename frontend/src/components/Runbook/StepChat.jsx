import { useState } from 'react';

/**
 * StepChat — the "Ask AI about this step…" input bar
 * Sits inside the step card footer bar, between the status label and the action button.
 *
 * Props:
 *   stepId    {string}  — which step this belongs to (for scoping)
 *   status    {string}  — 'running' | 'idle' | 'not-executed'
 *   onSend    {fn}      — optional callback with (stepId, message)
 */
export default function StepChat({ stepId, status, onSend }) {
  const [msg, setMsg] = useState('');

  const placeholder = status === 'running'
    ? 'Are you facing any errors/issues here?'
    : 'Ask AI about this step...';

  function handleSend() {
    const trimmed = msg.trim();
    if (!trimmed) return;
    onSend?.(stepId, trimmed);
    setMsg('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend();
  }

  return (
    <div className="flex-1 mx-4 flex items-center bg-slate-200/50 rounded-lg px-3 py-1.5
                    focus-within:ring-1 focus-within:ring-primary/30 transition-all">
      <input
        className="bg-transparent border-none focus:ring-0 outline-none text-xs w-full p-0
                   text-slate-600 placeholder:text-slate-400"
        placeholder={placeholder}
        type="text"
        value={msg}
        onChange={e => setMsg(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="text-slate-400 hover:text-primary transition-colors ml-2 shrink-0"
        onClick={handleSend}
        title="Send"
      >
        <span className="material-symbols-outlined text-lg">send</span>
      </button>
    </div>
  );
}
