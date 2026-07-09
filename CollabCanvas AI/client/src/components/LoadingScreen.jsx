import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-ink">
      <motion.div className="text-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-accent shadow-[0_0_60px_rgba(34,197,94,0.45)]" />
        <h1 className="text-2xl font-bold text-white">CollabCanvas AI</h1>
        <p className="mt-2 text-sm text-slate-400">Preparing your shared whiteboard...</p>
      </motion.div>
    </div>
  );
}
