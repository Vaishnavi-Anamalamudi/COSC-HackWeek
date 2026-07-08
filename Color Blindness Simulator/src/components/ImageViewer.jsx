import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaImage } from 'react-icons/fa';
import ComparisonSlider from './ComparisonSlider';
import Magnifier from './Magnifier';

export default function ImageViewer({
  image,
  simulatedSrc,
  splitMode,
  zoom,
  pan,
  setPan,
  magnifierZoom,
  isProcessing,
}) {
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const [magnifier, setMagnifier] = useState({ active: false, x: 0, y: 0, px: 0, py: 0 });

  const updateMagnifier = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setMagnifier({
      active: true,
      x,
      y,
      px: (x / rect.width) * 100,
      py: (y / rect.height) * 100,
    });
  };

  const startPan = (event) => {
    if (splitMode === 'slider') return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      pan,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (event) => {
    updateMagnifier(event);
    if (!dragRef.current || splitMode === 'slider') return;
    const nextX = dragRef.current.pan.x + event.clientX - dragRef.current.x;
    const nextY = dragRef.current.pan.y + event.clientY - dragRef.current.y;
    setPan({ x: nextX, y: nextY });
  };

  const stopPan = () => {
    dragRef.current = null;
  };

  const renderComparison = () => {
    if (!image) {
      return (
        <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-2xl text-accent">
            <FaImage aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-text">Upload an image to begin</p>
          <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">The preview will show original and simulated color perception with zoom, pan, split, and magnifier tools.</p>
        </div>
      );
    }

    if (splitMode === 'slider') {
      return <ComparisonSlider originalSrc={image.src} simulatedSrc={simulatedSrc} />;
    }

    if (splitMode === 'vertical' || splitMode === 'horizontal') {
      const vertical = splitMode === 'vertical';
      return (
        <div className={`grid h-full min-h-96 gap-3 ${vertical ? 'grid-cols-1 lg:grid-cols-2' : 'grid-rows-2'}`}>
          <ImagePane label="Original" src={image.src} zoom={zoom} pan={pan} />
          <ImagePane label="Simulation" src={simulatedSrc} zoom={zoom} pan={pan} accent />
        </div>
      );
    }

    return (
      <div className="relative h-full min-h-96 overflow-hidden rounded-2xl bg-slate-950">
        <img className="viewer-image" src={image.src} alt="Original" draggable="false" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} />
        <img className="viewer-image absolute inset-0 mix-blend-normal opacity-75" src={simulatedSrc} alt="Simulated overlay" draggable="false" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} />
        <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-text">Overlay</span>
      </div>
    );
  };

  return (
    <section
      ref={frameRef}
      className="glass-panel relative min-h-[520px] overflow-hidden p-3"
      aria-label="Image comparison viewer"
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={stopPan}
      onPointerCancel={stopPan}
      onMouseLeave={() => {
        stopPan();
        setMagnifier((value) => ({ ...value, active: false }));
      }}
    >
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="absolute inset-3 z-40 flex items-center justify-center rounded-2xl bg-slate-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-accent" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="h-full min-h-[496px]"
        key={image?.id || 'empty'}
        initial={{ opacity: 0.5, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {renderComparison()}
      </motion.div>
      {image && splitMode !== 'slider' && (
        <Magnifier
          active={magnifier.active}
          x={magnifier.x}
          y={magnifier.y}
          imageSrc={simulatedSrc}
          zoom={magnifierZoom}
          px={magnifier.px}
          py={magnifier.py}
        />
      )}
    </section>
  );
}

function ImagePane({ label, src, zoom, pan, accent = false }) {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-slate-950">
      <img
        className="viewer-image"
        src={src}
        alt={label}
        draggable="false"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      />
      <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${accent ? 'bg-accent text-slate-950' : 'bg-slate-950/80 text-text'}`}>
        {label}
      </span>
    </div>
  );
}
