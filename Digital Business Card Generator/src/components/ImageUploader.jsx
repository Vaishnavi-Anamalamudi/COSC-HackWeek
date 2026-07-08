import { useRef, useState } from 'react';
import { FaImage, FaUpload, FaXmark } from 'react-icons/fa6';

export default function ImageUploader({ image, onChange }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-200">Profile image</label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          'group flex min-h-36 cursor-pointer items-center gap-4 rounded-lg border border-dashed p-4 transition',
          isDragging
            ? 'border-accent bg-accent/10 shadow-glow'
            : 'border-white/15 bg-white/[0.035] hover:border-accent/70 hover:bg-white/[0.06]',
        ].join(' ')}
      >
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-black/30">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <FaImage className="text-2xl text-zinc-500 transition group-hover:text-accent" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <FaUpload className="text-accent" />
            Drag, drop, or browse
          </div>
          <p className="mt-1 text-sm leading-5 text-zinc-400">
            Use a square headshot for the sharpest social preview and print output.
          </p>
        </div>

        {image && (
          <button
            type="button"
            aria-label="Remove profile image"
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-zinc-300 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-200"
          >
            <FaXmark />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => readFile(event.target.files?.[0])}
      />
    </div>
  );
}
