import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Authentication from './components/Authentication.jsx';
import Calendar from './components/Calendar.jsx';
import CapsuleEditor from './components/CapsuleEditor.jsx';
import Dashboard from './components/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Timeline from './components/Timeline.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { useCapsules } from './hooks/useCapsules.js';

const views = {
  dashboard: 'Dashboard',
  capsules: 'My Capsules',
  create: 'Create Capsule',
  calendar: 'Calendar',
  timeline: 'Timeline',
  favorites: 'Favorites',
  settings: 'Settings',
};

function Shell() {
  const { user, guest } = useAuth();
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', privacy: 'all', category: 'all' });
  const [editingCapsule, setEditingCapsule] = useState(null);
  const capsuleStore = useCapsules(user, guest);

  const title = views[activeView] || views.dashboard;

  const shownEditor = activeView === 'create' || editingCapsule;
  const content = useMemo(() => {
    if (shownEditor) {
      return (
        <CapsuleEditor
          capsule={editingCapsule}
          onCancel={() => {
            setEditingCapsule(null);
            setActiveView('dashboard');
          }}
          onSave={async (capsule) => {
            await capsuleStore.saveCapsule(capsule);
            setEditingCapsule(null);
            setActiveView('dashboard');
          }}
        />
      );
    }

    if (activeView === 'calendar') {
      return <Calendar capsules={capsuleStore.capsules} onEdit={setEditingCapsule} />;
    }

    if (activeView === 'timeline') {
      return <Timeline capsules={capsuleStore.capsules} onEdit={setEditingCapsule} />;
    }

    return (
      <Dashboard
        activeView={activeView}
        capsules={capsuleStore.capsules}
        loading={capsuleStore.loading}
        error={capsuleStore.error}
        search={search}
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={setEditingCapsule}
        onCreate={() => setActiveView('create')}
        onDelete={capsuleStore.deleteCapsule}
        onDuplicate={capsuleStore.duplicateCapsule}
        onArchive={capsuleStore.archiveCapsule}
        onToggleFavorite={capsuleStore.toggleFavorite}
      />
    );
  }, [activeView, capsuleStore, editingCapsule, filters, search, shownEditor]);

  if (!user && !guest) return <Authentication />;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-vault-ink dark:text-slate-50">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="min-h-screen lg:pl-72">
          <Navbar
            title={title}
            search={search}
            onSearch={setSearch}
            onCreate={() => setActiveView('create')}
          />
          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={shownEditor ? `editor-${editingCapsule?.id || 'new'}` : activeView}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}
