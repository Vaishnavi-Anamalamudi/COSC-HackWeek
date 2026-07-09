import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiArchive, FiCopy, FiDownload, FiEdit3, FiFileText, FiHeart, FiLock, FiMapPin, FiShare2, FiTrash2, FiUnlock } from 'react-icons/fi';
import QRCode from 'qrcode';
import { categories } from '../constants/categories.js';
import { verifyPassword } from '../utils/encryption.js';
import { classNames, downloadJson, exportElementToPdf, formatUnlock } from '../utils/helpers.js';
import CountdownTimer from './CountdownTimer.jsx';

function MediaPreview({ files = [] }) {
  if (!files.length) {
    return <div className="grid aspect-video place-items-center rounded-lg bg-slate-100 text-sm text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">No media attached</div>;
  }

  const [first, ...rest] = files;
  return (
    <div className="grid gap-2">
      <div className="overflow-hidden rounded-lg bg-slate-100 dark:bg-vault-ink">
        {first.type?.startsWith('image/') && <img className="aspect-video w-full object-cover" src={first.url} alt={first.name} />}
        {first.type?.startsWith('video/') && <video className="aspect-video w-full object-cover" src={first.url} controls />}
        {first.type?.startsWith('audio/') && (
          <div className="p-4">
            <audio className="w-full" src={first.url} controls />
          </div>
        )}
        {!first.type?.startsWith('image/') && !first.type?.startsWith('video/') && !first.type?.startsWith('audio/') && (
          <a className="flex aspect-video items-center justify-center gap-2 text-vault-accent" href={first.url} target="_blank" rel="noreferrer">
            <FiFileText aria-hidden="true" />
            Open document
          </a>
        )}
      </div>
      {rest.length > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">+{rest.length} more attachment{rest.length === 1 ? '' : 's'}</p>}
    </div>
  );
}

export default function CapsuleCard({ capsule, onEdit, onDelete, onDuplicate, onArchive, onToggleFavorite }) {
  const [password, setPassword] = useState('');
  const [passwordOk, setPasswordOk] = useState(capsule.privacy !== 'password');
  const [qr, setQr] = useState('');
  const category = categories.find((item) => item.id === capsule.category) || categories[0];
  const CategoryIcon = category.icon;
  const locked = capsule.status === 'locked';
  const exportId = `capsule-export-${capsule.id}`;

  async function share() {
    const url = `${window.location.origin}?capsule=${capsule.id}`;
    const qrData = await QRCode.toDataURL(url, { margin: 1, width: 180, color: { dark: '#0B1120', light: '#FFFFFF' } });
    setQr(qrData);
    if (navigator.share) await navigator.share({ title: capsule.title, text: 'Open this ChronoVault capsule', url });
  }

  const canReveal = !locked && passwordOk;

  return (
    <motion.article layout className="vault-card overflow-hidden" whileHover={{ y: -3 }}>
      <div id={exportId} className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-lg" style={{ backgroundColor: `${category.color}22`, color: category.color }}>
              <CategoryIcon aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-extrabold">{capsule.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Unlocks {formatUnlock(capsule.unlockAt)}</p>
            </div>
          </div>
          <button className={classNames('icon-button', capsule.favorite && 'border-vault-accent text-vault-accent')} type="button" title="Favorite" aria-label="Favorite" onClick={() => onToggleFavorite(capsule.id)}>
            <FiHeart aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">{category.label}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">{capsule.privacy}</span>
          <span className={classNames('rounded-full px-3 py-1 capitalize', locked ? 'bg-amber-400/10 text-amber-600 dark:text-amber-200' : 'bg-vault-accent/10 text-emerald-700 dark:text-vault-accent')}>
            {locked ? 'locked' : 'unlocked'}
          </span>
        </div>

        {locked ? (
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="mb-3 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-100">
              <FiLock aria-hidden="true" />
              Time sealed
            </div>
            <CountdownTimer target={capsule.unlockAt} compact />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-vault-accent/25 bg-vault-accent/10 p-4">
            <motion.div className="absolute inset-x-0 top-0 h-1 bg-vault-accent" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: 2, duration: 1.1 }} />
            <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-700 dark:text-vault-accent">
              <FiUnlock aria-hidden="true" />
              Capsule unlocked
            </div>
            {capsule.privacy === 'password' && !passwordOk ? (
              <div className="flex gap-2">
                <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter capsule password" />
                <button className="primary-button" type="button" onClick={() => setPasswordOk(verifyPassword(password, capsule.passwordHash))}>
                  Open
                </button>
              </div>
            ) : (
              <p className="line-clamp-4 text-sm leading-6 text-slate-700 dark:text-slate-200">{capsule.message}</p>
            )}
          </div>
        )}

        {canReveal && (
          <>
            <MediaPreview files={capsule.files} />
            <div className="grid gap-2 text-sm text-slate-500 dark:text-slate-400">
              {capsule.location && (
                <p className="flex items-center gap-2">
                  <FiMapPin aria-hidden="true" />
                  {capsule.location}
                </p>
              )}
              {capsule.mood && <p>Mood: {capsule.mood}</p>}
              {capsule.signature && <p className="font-serif italic">&quot;{capsule.signature}&quot;</p>}
            </div>
            {capsule.backgroundMusic && <audio className="w-full" src={capsule.backgroundMusic} controls />}
          </>
        )}

        {qr && <img className="h-28 w-28 rounded-lg bg-white p-2" src={qr} alt="Capsule sharing QR code" />}
      </div>

      <div className="grid grid-cols-4 border-t border-slate-200 dark:border-white/10 sm:grid-cols-7">
        <button className="grid place-items-center p-3 text-slate-500 hover:text-vault-accent" type="button" title="Edit" onClick={() => onEdit(capsule)}>
          <FiEdit3 aria-hidden="true" />
        </button>
        <button className="grid place-items-center p-3 text-slate-500 hover:text-vault-accent" type="button" title="Duplicate" onClick={() => onDuplicate(capsule.id)}>
          <FiCopy aria-hidden="true" />
        </button>
        <button className="grid place-items-center p-3 text-slate-500 hover:text-vault-accent" type="button" title="Archive" onClick={() => onArchive(capsule.id)}>
          <FiArchive aria-hidden="true" />
        </button>
        <button className="grid place-items-center p-3 text-slate-500 hover:text-vault-accent" type="button" title="Share" onClick={share}>
          <FiShare2 aria-hidden="true" />
        </button>
        <button className="grid place-items-center p-3 text-slate-500 hover:text-vault-accent" type="button" title="Download JSON" onClick={() => downloadJson(`${capsule.title}.json`, capsule)}>
          <FiDownload aria-hidden="true" />
        </button>
        <button className="grid place-items-center p-3 text-slate-500 hover:text-vault-accent" type="button" title="Export PDF" onClick={() => exportElementToPdf(exportId, `${capsule.title}.pdf`)}>
          <FiFileText aria-hidden="true" />
        </button>
        <button className="grid place-items-center p-3 text-rose-500 hover:text-rose-400" type="button" title="Delete" onClick={() => onDelete(capsule.id)}>
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
}
