import {
  FaCompress,
  FaExpand,
  FaMinus,
  FaPlus,
  FaSearchPlus,
  FaUndo,
} from 'react-icons/fa';

const splitModes = [
  { id: 'slider', label: 'Slider' },
  { id: 'vertical', label: 'Vertical' },
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'overlay', label: 'Overlay' },
];

export default function Toolbar({
  zoom,
  zoomIn,
  zoomOut,
  reset,
  fit,
  splitMode,
  onSplitModeChange,
  magnifierZoom,
  onMagnifierZoomChange,
  onFullscreen,
}) {
  return (
    <div className="glass-panel flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2" aria-label="Viewer controls">
        <button className="icon-button" type="button" onClick={zoomOut} aria-label="Zoom out">
          <FaMinus aria-hidden="true" />
        </button>
        <span className="min-w-16 rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-center text-xs font-semibold text-slate-200">
          {Math.round(zoom * 100)}%
        </span>
        <button className="icon-button" type="button" onClick={zoomIn} aria-label="Zoom in">
          <FaPlus aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" onClick={fit} aria-label="Fit to screen">
          <FaCompress aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" onClick={reset} aria-label="Reset viewer">
          <FaUndo aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" onClick={onFullscreen} aria-label="Fullscreen viewer">
          <FaExpand aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="segmented" aria-label="Compare layout">
          {splitModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={splitMode === mode.id ? 'segmented-active' : ''}
              onClick={() => onSplitModeChange(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-300">
          <FaSearchPlus aria-hidden="true" className="text-accent" />
          <select
            className="bg-transparent text-text outline-none"
            value={magnifierZoom}
            aria-label="Magnifier zoom"
            onChange={(event) => onMagnifierZoomChange(Number(event.target.value))}
          >
            <option className="bg-panel" value={2}>2x</option>
            <option className="bg-panel" value={4}>4x</option>
            <option className="bg-panel" value={8}>8x</option>
          </select>
        </label>
      </div>
    </div>
  );
}
