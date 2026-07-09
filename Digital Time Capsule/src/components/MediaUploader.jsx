import { useState } from 'react';
import { FiFile, FiImage, FiMusic, FiUploadCloud, FiVideo, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';
import { uploadCapsuleFile } from '../services/storage.js';

function iconFor(type) {
  if (type?.startsWith('image/')) return FiImage;
  if (type?.startsWith('video/')) return FiVideo;
  if (type?.startsWith('audio/')) return FiMusic;
  return FiFile;
}

export default function MediaUploader({ files, onChange, capsuleId }) {
  const { user, guest } = useAuth();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  async function handleFiles(event) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    setError('');
    setProgress(1);
    try {
      const uploaded = [];
      for (const file of selected) {
        const saved = await uploadCapsuleFile(guest ? null : user?.uid, capsuleId, file, setProgress);
        uploaded.push(saved);
      }
      onChange([...files, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setProgress(0);
      event.target.value = '';
    }
  }

  return (
    <section className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-vault-accent hover:bg-vault-accent/5 dark:border-white/15 dark:bg-white/[0.04]">
        <FiUploadCloud className="mb-3 text-3xl text-vault-accent" aria-hidden="true" />
        <span className="font-semibold">Upload images, videos, audio, PDFs, or documents</span>
        <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">Firebase Storage is used when cloud auth is configured.</span>
        <input className="sr-only" type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" onChange={handleFiles} />
      </label>
      {progress > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-vault-accent transition-all" style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>
      )}
      {error && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 dark:text-rose-200">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => {
          const Icon = iconFor(file.type);
          return (
            <article key={file.id || file.url} className="vault-card overflow-hidden">
              <div className="relative aspect-video bg-slate-100 dark:bg-vault-ink">
                {file.type?.startsWith('image/') && <img className="h-full w-full object-cover" src={file.url} alt={file.name} />}
                {file.type?.startsWith('video/') && <video className="h-full w-full object-cover" src={file.url} controls />}
                {file.type?.startsWith('audio/') && (
                  <div className="grid h-full place-items-center p-4">
                    <FiMusic className="text-4xl text-vault-accent" aria-hidden="true" />
                    <audio className="mt-4 w-full" src={file.url} controls />
                  </div>
                )}
                {!file.type?.startsWith('image/') && !file.type?.startsWith('video/') && !file.type?.startsWith('audio/') && (
                  <div className="grid h-full place-items-center">
                    <Icon className="text-4xl text-vault-accent" aria-hidden="true" />
                  </div>
                )}
                <button
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-vault-ink/80 text-white"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onChange(files.filter((item) => item.id !== file.id))}
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{Math.ceil((file.size || 0) / 1024)} KB</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
