import { FaClock, FaFileImage, FaRulerCombined, FaWeightHanging } from 'react-icons/fa';
import { formatBytes } from '../utils/imageProcessor';

export default function ImageInfo({ image, history, onSelectHistory }) {
  const items = image
    ? [
        { icon: FaFileImage, label: 'File', value: image.name },
        { icon: FaRulerCombined, label: 'Size', value: `${image.width} x ${image.height}` },
        { icon: FaWeightHanging, label: 'Weight', value: formatBytes(image.size) },
        { icon: FaClock, label: 'Loaded', value: new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]
    : [];

  return (
    <section className="glass-panel p-4" aria-labelledby="image-info-heading">
      <h2 id="image-info-heading" className="panel-heading">Image Details</h2>
      {image ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="info-row">
                <Icon aria-hidden="true" className="text-accent" />
                <span className="text-slate-400">{item.label}</span>
                <strong className="truncate text-right text-text">{item.value}</strong>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-xs leading-5 text-slate-400">No image loaded yet.</p>
      )}

      <div className="mt-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recent</h3>
        <div className="space-y-2">
          {history.length ? (
            history.map((item) => (
              <button key={item.id} type="button" className="history-row" onClick={() => onSelectHistory(item)}>
                <img src={item.src} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <span className="min-w-0 text-left">
                  <span className="block truncate text-xs font-semibold text-text">{item.name}</span>
                  <span className="block text-[11px] text-slate-500">{item.width} x {item.height}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-500">Recent uploads are stored locally in this browser.</p>
          )}
        </div>
      </div>
    </section>
  );
}
