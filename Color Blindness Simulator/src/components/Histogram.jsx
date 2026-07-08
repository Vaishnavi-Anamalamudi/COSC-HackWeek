const channels = [
  { key: 'r', label: 'Red', color: '#EF4444' },
  { key: 'g', label: 'Green', color: '#22C55E' },
  { key: 'b', label: 'Blue', color: '#38BDF8' },
];

export default function Histogram({ histograms }) {
  return (
    <section className="glass-panel p-4" aria-labelledby="histogram-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="histogram-heading" className="panel-heading">RGB Histogram</h2>
        <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-400">Before / After</span>
      </div>
      {histograms ? (
        <div className="space-y-4">
          <HistogramSet title="Original" data={histograms.before} />
          <HistogramSet title="Simulation" data={histograms.after} />
        </div>
      ) : (
        <div className="grid h-40 place-items-center rounded-2xl border border-slate-800 bg-slate-950/50 text-xs text-slate-500">
          Histogram appears after upload
        </div>
      )}
    </section>
  );
}

function HistogramSet({ title, data }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="space-y-2">
        {channels.map((channel) => (
          <div key={channel.key} className="grid grid-cols-[48px_1fr] items-center gap-2">
            <span className="text-[11px] text-slate-400">{channel.label}</span>
            <svg className="h-10 w-full overflow-hidden rounded-lg bg-slate-950" viewBox="0 0 256 48" preserveAspectRatio="none" role="img" aria-label={`${title} ${channel.label} channel histogram`}>
              <HistogramPath values={data[channel.key]} color={channel.color} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistogramPath({ values, color }) {
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${index},${48 - (value / max) * 46}`).join(' ');
  return (
    <>
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={points} vectorEffect="non-scaling-stroke" />
      <polyline fill={`${color}33`} stroke="none" points={`0,48 ${points} 255,48`} />
    </>
  );
}
