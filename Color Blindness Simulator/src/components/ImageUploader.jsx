import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaPaste, FaUpload } from 'react-icons/fa';

const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function ImageUploader({ onFiles, onSample }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const submitFiles = (files) => {
    const validFiles = Array.from(files || []).filter((file) => acceptedTypes.includes(file.type));
    if (validFiles.length) onFiles(validFiles);
  };

  return (
    <motion.section
      className={`glass-panel p-4 transition ${isDragging ? 'border-accent shadow-glow' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600/80 bg-slate-950/40 p-5 text-center outline-none transition hover:border-accent/80 hover:bg-slate-900/70 focus-visible:ring-2 focus-visible:ring-accent"
        role="button"
        tabIndex={0}
        aria-label="Upload an image"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          submitFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={(event) => submitFiles(event.target.files)}
        />
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-glow">
          <FaUpload aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-text">Drop images or click to upload</p>
        <p className="mt-2 max-w-52 text-xs leading-5 text-slate-400">PNG, JPG, JPEG, and WEBP are supported. Clipboard paste works anywhere in the app.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="mini-tile">
          <FaImage aria-hidden="true" />
          <span>Batch ready</span>
        </div>
        <div className="mini-tile">
          <FaPaste aria-hidden="true" />
          <span>Paste image</span>
        </div>
      </div>

      <button className="mt-3 w-full rounded-xl border border-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-accent/70 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" type="button" onClick={onSample}>
        Load gradient sample
      </button>
    </motion.section>
  );
}
