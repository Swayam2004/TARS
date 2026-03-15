import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ValidationPanel from '../components/Validation/ValidationPanel';
import { getRunbook, validateRunbook, updateRunbookStatus } from '../api/client';
import { useTarsStore } from '../store/useTarsStore';

export default function Validate() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [runbook, setRunbook]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [started, setStarted]     = useState(false);
  const { validationResult, setValidationResult, setValidating } = useTarsStore();

  useEffect(() => {
    getRunbook(id).then(({ data }) => setRunbook(data));
    // Auto-start validation when page loads
    handleValidate();
  }, [id]);

  async function handleValidate() {
    setStarted(true);
    setLoading(true);
    setValidating(true);
    setValidationResult(null);
    try {
      // Stagger for dramatic effect — let the check grid animate first
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
    <div className="p-8 max-w-3xl mx-auto">
      <button className="text-zinc-600 hover:text-zinc-400 text-xs mb-4 transition-colors"
        onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Policy Validation</h1>
          {runbook && (
            <p className="text-zinc-500 text-sm mt-1">{runbook.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs" onClick={handleValidate} disabled={loading}>
            {loading ? '⚙ Checking…' : '↺ Re-validate'}
          </button>
          {allPassed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="btn-primary text-xs"
              onClick={handleApprove}
            >
              ▶ Approve &amp; Run
            </motion.button>
          )}
        </div>
      </div>

      {/* Validation agent label */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-brand-500 animate-pulse' : allPassed ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className="text-xs text-zinc-500">
          {loading ? 'Validation Agent running checks…' : validationResult ? validationResult.summary : 'Ready'}
        </span>
      </div>

      <ValidationPanel result={validationResult} loading={loading} />
    </div>
  );
}
