import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WorkspaceHeader from '../components/WorkspaceHeader';
import ValidationPanel from '../components/Validation/ValidationPanel';
import FloatingAIButton from '../components/Runbook/FloatingAIButton';
import { getRunbook, validateRunbook, updateRunbookStatus } from '../api/client';
import { useTarsStore } from '../store/useTarsStore';

export default function Validate() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [runbook, setRunbook]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const { validationResult, setValidationResult, setValidating } = useTarsStore();

  useEffect(() => {
    getRunbook(id).then(({ data }) => setRunbook(data));
    handleValidate();
  }, [id]);

  async function handleValidate() {
    setLoading(true);
    setValidating(true);
    setValidationResult(null);
    try {
      await new Promise(r => setTimeout(r, 800));
      const { data } = await validateRunbook(id);
      setValidationResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setValidating(false);
    }
  }

  async function handleApprove() {
    await updateRunbookStatus(id, 'APPROVED');
    navigate(`/execute/${id}`);
  }

  const allPassed = validationResult?.status === 'PASSED';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display">
      <WorkspaceHeader
        title={runbook?.name || 'Policy Validation'}
        version="Validation Agent"
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <button
          className="flex items-center gap-1 text-slate-500 hover:text-primary text-sm mb-6 transition-colors"
          onClick={() => navigate(-1)}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Policy Validation</h1>
            {runbook && <p className="text-slate-500 text-sm mt-1">{runbook.name}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100
                         rounded-lg text-sm font-medium border border-slate-200 transition-colors
                         disabled:opacity-40"
              onClick={handleValidate}
              disabled={loading}
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'sync' : 'refresh'}
              </span>
              {loading ? 'Checking…' : 'Re-validate'}
            </button>
            {allPassed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white
                           px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                onClick={handleApprove}
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Approve &amp; Run
              </motion.button>
            )}
          </div>
        </div>

        {/* Agent status indicator */}
        <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-lg bg-white border border-slate-200">
          <div className={`w-2 h-2 rounded-full shrink-0 ${loading ? 'bg-primary animate-pulse' : allPassed ? 'bg-emerald-500' : validationResult ? 'bg-red-500' : 'bg-slate-300'}`} />
          <span className="text-sm text-slate-600">
            {loading
              ? 'Validation Agent running policy checks…'
              : validationResult
                ? validationResult.summary
                : 'Ready to validate'}
          </span>
        </div>

        <ValidationPanel result={validationResult} loading={loading} />
      </main>

      <FloatingAIButton onClick={() => {}} />

      <footer className="max-w-3xl mx-auto w-full px-4 pb-8 pt-4 border-t border-slate-200
                         flex justify-between items-center text-slate-400 text-sm">
        <span>© 2026 TARS</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          GenW Platform connected
        </div>
      </footer>
    </div>
  );
}
