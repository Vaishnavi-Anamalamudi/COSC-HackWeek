import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ComparisonSlider({ originalSrc, simulatedSrc, orientation = 'vertical' }) {
  const [position, setPosition] = useState(50);
  const isHorizontal = orientation === 'horizontal';

  const updatePosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const raw = isHorizontal
      ? ((event.clientY - rect.top) / rect.height) * 100
      : ((event.clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, raw)));
  };

  const clipPath = isHorizontal
    ? `inset(0 0 ${100 - position}% 0)`
    : `inset(0 ${100 - position}% 0 0)`;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-950"
      onPointerMove={(event) => {
        if (event.buttons === 1) updatePosition(event);
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePosition(event);
      }}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setPosition((value) => Math.max(0, value - 3));
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setPosition((value) => Math.min(100, value + 3));
      }}
    >
      <img className="viewer-image" src={simulatedSrc} alt="Simulated result" draggable="false" />
      <img className="viewer-image absolute inset-0" src={originalSrc} alt="Original" style={{ clipPath }} draggable="false" />
      <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-text">Original</span>
      <span className="absolute right-4 top-4 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-slate-950">Simulation</span>
      <motion.span
        className={`absolute z-10 bg-text shadow-glow ${isHorizontal ? 'left-0 h-0.5 w-full' : 'top-0 h-full w-0.5'}`}
        animate={isHorizontal ? { top: `${position}%` } : { left: `${position}%` }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      />
      <motion.span
        className="absolute z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-slate-950/90 text-[10px] font-black text-text shadow-panel"
        animate={isHorizontal ? { left: '50%', top: `${position}%`, x: '-50%', y: '-50%' } : { left: `${position}%`, top: '50%', x: '-50%', y: '-50%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        ||
      </motion.span>
    </div>
  );
}
