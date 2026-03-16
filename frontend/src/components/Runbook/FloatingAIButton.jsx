/**
 * FloatingAIButton — fixed bottom-right AI assistant trigger
 * Props:
 *   onClick {fn} — handler when user clicks the button
 */
export default function FloatingAIButton({ onClick }) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={onClick}
        className="group flex items-center justify-center w-14 h-14
                   bg-primary text-white rounded-full shadow-2xl shadow-primary/30
                   hover:scale-110 transition-transform relative"
        title="Ask Runbook AI"
      >
        <span className="material-symbols-outlined text-3xl">auto_awesome</span>

        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs py-2 px-4
                         rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                         whitespace-nowrap pointer-events-none">
          Ask Runbook AI
        </span>
      </button>
    </div>
  );
}
