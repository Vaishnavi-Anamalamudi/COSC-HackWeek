import { addYears, format } from 'date-fns';
import { useMemo, useState } from 'react';
import { FiSave, FiX, FiZap } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';
import { categories, moodOptions, privacyOptions } from '../constants/categories.js';
import { hashPassword } from '../utils/encryption.js';
import { toDate, validateUnlockDate } from '../utils/helpers.js';
import MediaUploader from './MediaUploader.jsx';

const blankCapsule = {
  title: '',
  message: '',
  category: 'letter',
  privacy: 'private',
  unlockAt: addYears(new Date(), 1).toISOString(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  files: [],
  mood: 'Hopeful',
  location: '',
  signature: '',
  backgroundMusic: '',
  theme: 'emerald',
  favorite: false,
  archived: false,
};

export default function CapsuleEditor({ capsule, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...blankCapsule, ...capsule }));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const capsuleId = useMemo(() => form.id || uuid(), [form.id]);
  const unlockDate = toDate(form.unlockAt);

  function patch(value) {
    setForm((current) => ({ ...current, ...value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!validateUnlockDate(form.unlockAt)) {
      setError('Choose an unlock time at least one minute in the future.');
      return;
    }
    if (form.privacy === 'password' && !form.passwordHash && password.length < 6) {
      setError('Password protected capsules need a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await onSave({
        ...form,
        id: form.id || capsuleId,
        title: form.title.trim(),
        message: form.message.trim(),
        passwordHash: password ? hashPassword(password) : form.passwordHash || null,
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function summarize() {
    setAiSummary('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, message: form.message, mediaCount: form.files.length }),
      });
      const data = await response.json();
      setAiSummary(data.summary);
    } catch {
      setAiSummary('AI summary is ready once the Express API is running.');
    }
  }

  return (
    <form className="grid gap-6 xl:grid-cols-[1fr_380px]" onSubmit={submit}>
      <section className="vault-card p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">{capsule ? 'Edit capsule' : 'Create capsule'}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every field is saved into the encrypted metadata payload.</p>
          </div>
          <div className="flex gap-2">
            <button className="secondary-button" type="button" onClick={onCancel}>
              <FiX aria-hidden="true" />
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={busy}>
              <FiSave aria-hidden="true" />
              Save
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold">Capsule title</span>
            <input className="field" value={form.title} onChange={(event) => patch({ title: event.target.value })} required placeholder="For my future self" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Unlock date</span>
            <input
              className="field"
              type="date"
              value={format(unlockDate, 'yyyy-MM-dd')}
              onChange={(event) => patch({ unlockAt: new Date(`${event.target.value}T${format(unlockDate, 'HH:mm')}`).toISOString() })}
              required
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Unlock time</span>
            <input
              className="field"
              type="time"
              value={format(unlockDate, 'HH:mm')}
              onChange={(event) => patch({ unlockAt: new Date(`${format(unlockDate, 'yyyy-MM-dd')}T${event.target.value}`).toISOString() })}
              required
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Category</span>
            <select className="field" value={form.category} onChange={(event) => patch({ category: event.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Privacy</span>
            <select className="field" value={form.privacy} onChange={(event) => patch({ privacy: event.target.value })}>
              {privacyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {form.privacy === 'password' && (
            <label>
              <span className="mb-1 block text-sm font-semibold">Capsule password</span>
              <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={form.passwordHash ? 'Leave blank to keep current' : 'Minimum 6 characters'} />
            </label>
          )}
          <label>
            <span className="mb-1 block text-sm font-semibold">Mood</span>
            <select className="field" value={form.mood} onChange={(event) => patch({ mood: event.target.value })}>
              {moodOptions.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Location</span>
            <input className="field" value={form.location} onChange={(event) => patch({ location: event.target.value })} placeholder="City, place, or memory map pin" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Digital signature</span>
            <input className="field" value={form.signature} onChange={(event) => patch({ signature: event.target.value })} placeholder="Signed, future me" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-semibold">Background music URL</span>
            <input className="field" value={form.backgroundMusic} onChange={(event) => patch({ backgroundMusic: event.target.value })} placeholder="Optional audio link" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold">Letter, note, or memory</span>
            <textarea className="field min-h-48 resize-y" value={form.message} onChange={(event) => patch({ message: event.target.value })} required placeholder="Write the memory you want time to protect..." />
          </label>
        </div>

        {error && <p className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 dark:text-rose-200">{error}</p>}
      </section>

      <aside className="space-y-5">
        <section className="vault-card p-5">
          <h3 className="mb-3 text-lg font-bold">Media vault</h3>
          <MediaUploader files={form.files || []} onChange={(files) => patch({ files })} capsuleId={capsuleId} />
        </section>
        <section className="vault-card p-5">
          <button className="secondary-button w-full" type="button" onClick={summarize}>
            <FiZap aria-hidden="true" />
            AI memory summary
          </button>
          {aiSummary && <p className="mt-3 rounded-lg bg-vault-accent/10 p-3 text-sm text-slate-700 dark:text-slate-200">{aiSummary}</p>}
        </section>
      </aside>
    </form>
  );
}
