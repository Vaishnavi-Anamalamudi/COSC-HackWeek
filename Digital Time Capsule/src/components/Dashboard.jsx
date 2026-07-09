import { AnimatePresence } from 'framer-motion';
import { FiArchive, FiClock, FiLock, FiPlus, FiStar, FiUnlock } from 'react-icons/fi';
import { categories, privacyOptions } from '../constants/categories.js';
import { daysUntil, getCapsuleStatus } from '../utils/helpers.js';
import CapsuleCard from './CapsuleCard.jsx';
import CountdownTimer from './CountdownTimer.jsx';

function Stat({ icon: Icon, label, value, tone = 'text-vault-accent' }) {
  return (
    <div className="vault-card p-4">
      <div className={`mb-4 grid h-10 w-10 place-items-center rounded-lg bg-current/10 ${tone}`}>
        <Icon aria-hidden="true" />
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function Dashboard({
  activeView,
  capsules,
  loading,
  error,
  search,
  filters,
  onFiltersChange,
  onCreate,
  ...actions
}) {
  const stats = {
    locked: capsules.filter((capsule) => capsule.status === 'locked').length,
    unlocked: capsules.filter((capsule) => capsule.status === 'unlocked').length,
    upcoming: capsules.filter((capsule) => capsule.status === 'locked' && daysUntil(capsule.unlockAt) <= 30).length,
    favorites: capsules.filter((capsule) => capsule.favorite).length,
  };
  const nextCapsule = capsules.find((capsule) => capsule.status === 'locked' && !capsule.archived);

  const filtered = capsules.filter((capsule) => {
    const textMatch = `${capsule.title} ${capsule.message} ${capsule.location}`.toLowerCase().includes(search.toLowerCase());
    const status = getCapsuleStatus(capsule);
    const viewMatch =
      activeView === 'favorites' ? capsule.favorite : activeView === 'capsules' ? !capsule.archived : activeView === 'settings' ? true : !capsule.archived;
    return (
      textMatch &&
      viewMatch &&
      (filters.status === 'all' || status === filters.status) &&
      (filters.privacy === 'all' || capsule.privacy === filters.privacy) &&
      (filters.category === 'all' || capsule.category === filters.category)
    );
  });

  if (activeView === 'settings') {
    return (
      <section className="vault-card p-6">
        <h2 className="text-2xl font-extrabold">Vault settings</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <p className="font-semibold">Security posture</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Metadata is AES encrypted before Firestore writes. Storage rules isolate uploads by user ID. Protected routes are enforced in the React shell.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <p className="font-semibold">PWA and offline</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Guest mode persists locally, and the architecture is ready for a service worker or Firebase offline persistence.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FiLock} label="Locked capsules" value={stats.locked} />
        <Stat icon={FiUnlock} label="Unlocked memories" value={stats.unlocked} tone="text-vault-sky" />
        <Stat icon={FiClock} label="Opening within 30 days" value={stats.upcoming} tone="text-vault-gold" />
        <Stat icon={FiStar} label="Favorites" value={stats.favorites} tone="text-vault-rose" />
      </section>

      {nextCapsule && (
        <section className="glass-panel rounded-lg p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Next unlock</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{nextCapsule.title}</p>
            </div>
            <span className="rounded-full bg-vault-accent/10 px-3 py-1 text-sm font-semibold text-vault-accent">{Math.max(0, daysUntil(nextCapsule.unlockAt))} days away</span>
          </div>
          <CountdownTimer target={nextCapsule.unlockAt} />
        </section>
      )}

      <section className="vault-card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="field" value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}>
            <option value="all">All statuses</option>
            <option value="locked">Locked</option>
            <option value="unlocked">Unlocked</option>
            <option value="archived">Archived</option>
          </select>
          <select className="field" value={filters.category} onChange={(event) => onFiltersChange({ ...filters, category: event.target.value })}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <select className="field" value={filters.privacy} onChange={(event) => onFiltersChange({ ...filters, privacy: event.target.value })}>
            <option value="all">All privacy</option>
            {privacyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="primary-button" type="button" onClick={onCreate}>
            <FiPlus aria-hidden="true" />
            Create Capsule
          </button>
        </div>
      </section>

      {error && <p className="rounded-lg bg-rose-500/10 p-4 text-sm text-rose-500 dark:text-rose-200">{error}</p>}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-lg bg-slate-200 dark:bg-white/[0.06]" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} {...actions} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && (
        <div className="vault-card grid min-h-64 place-items-center p-8 text-center">
          <div>
            <FiArchive className="mx-auto mb-3 text-4xl text-vault-accent" aria-hidden="true" />
            <p className="text-lg font-bold">No capsules match this view</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adjust filters or create a new memory capsule.</p>
          </div>
        </div>
      )}
    </div>
  );
}
