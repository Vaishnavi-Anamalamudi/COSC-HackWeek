import { motion } from 'framer-motion';
import { FiFile, FiImage, FiX } from 'react-icons/fi';

export default function ExportPanel({ open, onClose, onExport }) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <motion.div className="glass-panel w-full max-w-md rounded-3xl p-5" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Export whiteboard</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close export panel" title="Close">
            <FiX />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <button className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-accent" type="button" onClick={() => onExport('png')}>
            <FiImage className="mb-4 text-accent" size={24} />
            <span className="text-sm font-semibold text-white">PNG</span>
          </button>
          <button className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-accent" type="button" onClick={() => onExport('jpeg')}>
            <FiImage className="mb-4 text-accent" size={24} />
            <span className="text-sm font-semibold text-white">JPEG</span>
          </button>
          <button className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-accent" type="button" onClick={() => onExport('pdf')}>
            <FiFile className="mb-4 text-accent" size={24} />
            <span className="text-sm font-semibold text-white">PDF</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
