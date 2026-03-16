import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadDocument } from '../../api/client';
import { useTarsStore } from '../../store/useTarsStore';
import { useNavigate } from 'react-router-dom';

export default function DropZone() {
  const [status,   setStatus]   = useState('idle');
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState('');
  const [error,    setError]    = useState('');
  const setCurrentDocId = useTarsStore(s => s.setCurrentDocId);
  const resetPipeline   = useTarsStore(s => s.resetPipeline);
  const navigate        = useNavigate();

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
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
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
          ${isDragActive
            ? 'border-primary bg-primary/5 shadow-inner'
            : 'border-slate-300 hover:border-primary/50 hover:bg-primary/[0.02] bg-white'}
          ${status === 'uploading' ? 'cursor-wait' : ''}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4
                ${isDragActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                <span className="material-symbols-outlined text-3xl">
                  {isDragActive ? 'file_upload' : 'upload_file'}
                </span>
              </div>
              <p className="text-slate-800 font-semibold mb-1">
                {isDragActive ? 'Drop to upload' : 'Drop your procedure document here'}
              </p>
              <p className="text-slate-400 text-sm">PDF, DOCX, MD, TXT · up to 20MB</p>
              {!isDragActive && (
                <button className="mt-4 px-5 py-2 bg-primary hover:bg-primary/90 text-white
                                   text-sm font-bold rounded-lg transition-all shadow-sm pointer-events-none">
                  Browse files
                </button>
              )}
            </motion.div>
          )}

          {status === 'uploading' && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
              </div>
              <p className="text-slate-700 font-semibold mb-3">Uploading {filename}…</p>
              <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-slate-400 text-xs mt-2">{progress}%</p>
            </motion.div>
          )}

          {status === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
              </div>
              <p className="text-emerald-600 font-semibold">Uploaded — starting pipeline…</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
              </div>
              <p className="text-red-600 font-semibold">Upload failed</p>
              <p className="text-slate-400 text-sm mt-1">{error}</p>
              <button
                className="mt-4 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50
                           rounded-lg text-sm font-medium transition-colors"
                onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-slate-400 text-xs mt-4">
        Demo file:{' '}
        <span className="font-mono text-slate-500">Database_Failover_Procedure.pdf</span>
      </p>
    </div>
  );
}
