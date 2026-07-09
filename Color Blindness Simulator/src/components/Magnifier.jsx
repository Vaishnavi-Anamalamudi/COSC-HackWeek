export default function Magnifier({ active, x, y, px, py, imageSrc, zoom }) {
  if (!active) return null;

  const size = 164;
  return (
    <div
      className="pointer-events-none absolute z-30 hidden rounded-full border border-accent/70 bg-slate-950 shadow-glow md:block"
      style={{
        width: size,
        height: size,
        left: x - size / 2,
        top: y - size / 2,
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: `${zoom * 100}%`,
        backgroundPosition: `${px}% ${py}%`,
      }}
      aria-hidden="true"
    >
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/90 px-2 py-1 text-[10px] font-semibold text-accent">
        {zoom}x
      </span>
    </div>
  );
}
