import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaGithub,
  FaHighlighter,
  FaQuestionCircle,
  FaRedo,
  FaSun,
  FaUniversalAccess,
} from 'react-icons/fa';
import DownloadPanel from './components/DownloadPanel';
import Histogram from './components/Histogram';
import ImageInfo from './components/ImageInfo';
import ImageUploader from './components/ImageUploader';
import ImageViewer from './components/ImageViewer';
import SimulationSelector from './components/SimulationSelector';
import Toolbar from './components/Toolbar';
import { simulationModes } from './constants/simulationModes';
import { useCanvas } from './hooks/useCanvas';
import { useSimulation } from './hooks/useSimulation';
import { readImageFile } from './utils/imageProcessor';

const STORAGE_KEY = 'cbs-history-v1';
const SIMULATION_KEY = 'cbs-simulations-v1';

export default function App() {
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState(() => loadStored(STORAGE_KEY));
  const [simulationHistory, setSimulationHistory] = useState(() => loadStored(SIMULATION_KEY));
  const [mode, setMode] = useState('deuteranopia');
  const [intensity, setIntensity] = useState(100);
  const [splitMode, setSplitMode] = useState('slider');
  const [magnifierZoom, setMagnifierZoom] = useState(4);
  const [highContrast, setHighContrast] = useState(false);
  const [notice, setNotice] = useState('');
  const canvas = useCanvas();

  const selectedMode = useMemo(
    () => simulationModes.find((item) => item.id === mode) || simulationModes[0],
    [mode],
  );

  const { simulatedSrc, histograms, isProcessing, error } = useSimulation({
    image,
    mode,
    intensity,
  });

  const commitHistory = useCallback((nextImage) => {
    setImage(nextImage);
    setHistory((current) => {
      const next = [nextImage, ...current.filter((item) => item.id !== nextImage.id)].slice(0, 6);
      saveStored(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const handleFiles = useCallback(
    async (files) => {
      const parsedImages = await Promise.all(files.map(readImageFile));
      if (!parsedImages.length) return;
      commitHistory(parsedImages[0]);
      setNotice(`${parsedImages.length} image${parsedImages.length > 1 ? 's' : ''} ready`);
      if (parsedImages.length > 1) {
        setHistory((current) => {
          const next = [...parsedImages, ...current].filter(
            (item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index,
          ).slice(0, 6);
          saveStored(STORAGE_KEY, next);
          return next;
        });
      }
    },
    [commitHistory],
  );

  useEffect(() => {
    const handlePaste = (event) => {
      const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith('image/'));
      if (files.length) handleFiles(files);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFiles]);

  useEffect(() => {
    if (!image) return;
    const entry = {
      id: `${image.id}-${mode}-${intensity}`,
      imageName: image.name,
      mode: selectedMode.label,
      intensity,
      createdAt: new Date().toISOString(),
    };
    setSimulationHistory((current) => {
      const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 5);
      saveStored(SIMULATION_KEY, next);
      return next;
    });
  }, [image, intensity, mode, selectedMode.label]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const loadSample = () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 1440;
    canvasElement.height = 920;
    const context = canvasElement.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 1440, 920);
    gradient.addColorStop(0, '#EF4444');
    gradient.addColorStop(0.27, '#F59E0B');
    gradient.addColorStop(0.5, '#22C55E');
    gradient.addColorStop(0.74, '#38BDF8');
    gradient.addColorStop(1, '#8B5CF6');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1440, 920);
    context.fillStyle = 'rgba(11, 17, 32, 0.72)';
    context.fillRect(120, 120, 1200, 680);
    context.fillStyle = '#F8FAFC';
    context.font = '700 72px Inter, sans-serif';
    context.fillText('Accessibility Color Check', 180, 260);
    context.font = '500 34px Inter, sans-serif';
    context.fillText('Red error  |  Green success  |  Blue info  |  Yellow warning', 180, 340);
    ['#EF4444', '#22C55E', '#38BDF8', '#FACC15', '#A855F7'].forEach((color, index) => {
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(190 + index * 210, 470, 150, 150, 28);
      context.fill();
    });
    commitHistory({
      id: `sample-${Date.now()}`,
      name: 'accessibility-gradient-sample.png',
      size: canvasElement.toDataURL('image/png').length,
      type: 'image/png',
      width: canvasElement.width,
      height: canvasElement.height,
      src: canvasElement.toDataURL('image/png'),
      createdAt: new Date().toISOString(),
    });
  };

  const resetAll = () => {
    setMode('deuteranopia');
    setIntensity(100);
    setSplitMode('slider');
    canvas.reset();
  };

  const fullscreenViewer = () => {
    document.querySelector('[data-fullscreen-viewer]')?.requestFullscreen?.();
  };

  return (
    <div className={`min-h-screen bg-ink text-text ${highContrast ? 'high-contrast' : ''}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,197,94,0.16),transparent_26%),radial-gradient(circle_at_88%_16%,rgba(56,189,248,0.12),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 py-4 lg:px-6">
        <TopNav highContrast={highContrast} onToggleContrast={() => setHighContrast((value) => !value)} />

        <main className="grid flex-1 gap-4 py-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <aside className="space-y-4">
            <ImageUploader onFiles={handleFiles} onSample={loadSample} />
            <SimulationSelector selectedMode={mode} onChange={setMode} />
            <section className="glass-panel p-4" aria-labelledby="intensity-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="intensity-heading" className="panel-heading">Intensity</h2>
                <span className="text-sm font-bold text-accent">{intensity}%</span>
              </div>
              <input
                className="w-full accent-accent"
                type="range"
                min="0"
                max="100"
                value={intensity}
                aria-label="Simulation intensity"
                onChange={(event) => setIntensity(Number(event.target.value))}
              />
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>0%</span>
                <span>Blend</span>
                <span>100%</span>
              </div>
            </section>
            <DownloadPanel image={image} mode={mode} intensity={intensity} simulatedSrc={simulatedSrc} selectedModeLabel={selectedMode.label} />
            <button className="action-button w-full justify-center" type="button" onClick={resetAll}>
              <FaRedo aria-hidden="true" />
              Reset Workspace
            </button>
          </aside>

          <section className="min-w-0 space-y-4" data-export-viewer data-fullscreen-viewer>
            <Toolbar
              zoom={canvas.zoom}
              zoomIn={canvas.zoomIn}
              zoomOut={canvas.zoomOut}
              reset={canvas.reset}
              fit={canvas.fit}
              splitMode={splitMode}
              onSplitModeChange={setSplitMode}
              magnifierZoom={magnifierZoom}
              onMagnifierZoomChange={setMagnifierZoom}
              onFullscreen={fullscreenViewer}
            />
            <ImageViewer
              image={image}
              simulatedSrc={simulatedSrc}
              splitMode={splitMode}
              zoom={canvas.zoom}
              pan={canvas.pan}
              setPan={canvas.setPan}
              magnifierZoom={magnifierZoom}
              isProcessing={isProcessing}
            />
            {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
          </section>

          <aside className="space-y-4">
            <ImageInfo image={image} history={history} onSelectHistory={commitHistory} />
            <Histogram histograms={histograms} />
            <AccessibilityNotes selectedMode={selectedMode} simulations={simulationHistory} />
          </aside>
        </main>
      </div>
      <AnimatePresence>
        {notice && (
          <motion.div
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-accent/30 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-text shadow-glow backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopNav({ highContrast, onToggleContrast }) {
  return (
    <header className="glass-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg text-slate-950 shadow-glow">
          <FaUniversalAccess aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-base font-bold text-text sm:text-lg">Color Blindness Simulator</h1>
          <p className="text-xs text-slate-400">Professional image accessibility preview</p>
        </div>
      </div>
      <nav className="flex items-center gap-2" aria-label="Application navigation">
        <button className="icon-button" type="button" aria-pressed={highContrast} aria-label="Toggle high contrast" onClick={onToggleContrast}>
          <FaSun aria-hidden="true" />
        </button>
        <a className="icon-button" href="https://github.com/" target="_blank" rel="noreferrer" aria-label="Open GitHub">
          <FaGithub aria-hidden="true" />
        </a>
        <a className="icon-button" href="#accessibility-notes" aria-label="Open help">
          <FaQuestionCircle aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}

function AccessibilityNotes({ selectedMode, simulations }) {
  return (
    <section id="accessibility-notes" className="glass-panel p-4" aria-labelledby="notes-heading">
      <div className="mb-3 flex items-center gap-2">
        <FaHighlighter aria-hidden="true" className="text-accent" />
        <h2 id="notes-heading" className="panel-heading">Accessibility Notes</h2>
      </div>
      <p className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
        {selectedMode.accessibility}
      </p>
      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recent Simulations</h3>
        <div className="space-y-2">
          {simulations.length ? (
            simulations.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
                <div className="flex items-center justify-between gap-2">
                  <strong className="truncate text-text">{item.mode}</strong>
                  <span className="text-accent">{item.intensity}%</span>
                </div>
                <p className="mt-1 truncate text-slate-500">{item.imageName}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Simulation activity will appear here.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function loadStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Large images can exceed storage quotas; the app still works without persisted history.
  }
}
