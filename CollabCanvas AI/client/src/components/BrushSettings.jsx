import ColorPicker from './ColorPicker.jsx';

export default function BrushSettings({ brush, setBrush, snapToGrid, setSnapToGrid }) {
  return (
    <div className="glass-panel absolute bottom-5 left-5 z-40 flex flex-wrap items-center gap-4 rounded-2xl px-4 py-3">
      <ColorPicker value={brush.color} onChange={(color) => setBrush((current) => ({ ...current, color }))} />
      <label className="flex items-center gap-2 text-xs text-slate-300">
        Size
        <input
          className="w-28 accent-accent"
          type="range"
          min="1"
          max="36"
          value={brush.size}
          onChange={(event) => setBrush((current) => ({ ...current, size: Number(event.target.value) }))}
        />
        <span className="w-6 text-right">{brush.size}</span>
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-300">
        Opacity
        <input
          className="w-28 accent-accent"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={brush.opacity}
          onChange={(event) => setBrush((current) => ({ ...current, opacity: Number(event.target.value) }))}
        />
        <span className="w-8 text-right">{Math.round(brush.opacity * 100)}%</span>
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input className="accent-accent" type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)} />
        Snap
      </label>
    </div>
  );
}
