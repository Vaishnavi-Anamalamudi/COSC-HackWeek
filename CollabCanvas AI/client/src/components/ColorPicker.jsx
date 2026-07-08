const colors = ['#111827', '#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {colors.map((color) => (
        <button
          className={`h-7 w-7 rounded-full border-2 ${value === color ? 'border-white' : 'border-transparent'}`}
          key={color}
          type="button"
          aria-label={color}
          title={color}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
      <input className="h-8 w-9 cursor-pointer rounded border border-slate-600 bg-transparent" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
