import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument } from '../../api/client';
import { useTarsStore } from '../../store/useTarsStore';
import { useNavigate } from 'react-router-dom';

export default function DropZone() {
  const [status, setStatus]     = useState('idle'); // idle | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState('');
  const [error, setError]       = useState('');
  const setCurrentDocId         = useTarsStore(s => s.setCurrentDocId);
  const resetPipeline           = useTarsStore(s => s.resetPipeline);
  const navigate                = useNavigate();

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    setFilename(file.name);
    setStatus('uploading');
    setProgress(0);
    setError('');
    resetPipeline();

    try {
      const { data } = await uploadDocument(file, pct => setProgress(pct));
      setCurrentDocId(data.docId);
      setStatus('done');
      setTimeout(() => navigate(`/synthesize/${data.docId}`), 600);
    } catch (e) {
      setStatus('error');
      setError(e.response?.data?.error || e.message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    maxFiles: 1,
    disabled: status === 'uploading',
  });

  return (
    <div className="max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-brand-500 bg-brand-600/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
          ${status === 'uploading' ? 'cursor-wait' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-4xl mb-4">📄</div>
              <p className="text-white font-medium mb-1">
                {isDragActive ? 'Drop to upload' : 'Drop your procedure document here'}
              </p>
              <p className="text-zinc-500 text-sm">PDF, DOCX, MD, TXT · up to 20MB</p>
            </motion.div>
          )}

          {status === 'uploading' && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-3xl mb-3 animate-pulse">⏳</div>
              <p className="text-white font-medium mb-3">Uploading {filename}…</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-zinc-500 text-xs mt-2">{progress}%</p>
            </motion.div>
          )}

          {status === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-3xl mb-2">✅</div>
              <p className="text-emerald-400 font-medium">Uploaded — starting pipeline…</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-3xl mb-2">❌</div>
              <p className="text-red-400 font-medium">Upload failed</p>
              <p className="text-zinc-500 text-sm mt-1">{error}</p>
              <button className="btn-secondary mt-4 text-xs" onClick={() => setStatus('idle')}>Try again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sample docs hint */}
      <p className="text-center text-zinc-600 text-xs mt-4">
        Try the demo doc: <span className="text-zinc-400 font-mono">Database_Failover_Procedure.pdf</span>
      </p>
    </div>
  );
}
