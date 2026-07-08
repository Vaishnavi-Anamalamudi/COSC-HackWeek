import { useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { v4 as uuid } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { runNova } from './interpreter/Interpreter.js';
import { examples } from './examples/index.js';
import Editor from './editor/Editor.jsx';
import Console from './editor/Console.jsx';
import Output from './editor/Output.jsx';
import Toolbar from './components/Toolbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import InspectorPanel from './components/InspectorPanel.jsx';

const STORAGE_KEY = 'novalang:last-program';

export default function App() {
  const [source, setSource] = useState(() => localStorage.getItem(STORAGE_KEY) || examples[0].source);
  const [result, setResult] = useState({ ok: true, output: [], errors: [], tokens: [], ast: null, timeline: [], memory: null });
  const [activePanel, setActivePanel] = useState('output');
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState(null);
  const [breakpoints, setBreakpoints] = useState([]);
  const [timelineCursor, setTimelineCursor] = useState(0);
  const [replLog, setReplLog] = useState([]);
  const fileInputRef = useRef(null);

  const stats = useMemo(() => ({
    tokens: result.tokens?.length || 0,
    steps: result.timeline?.length || 0,
    errors: result.errors?.length || 0
  }), [result]);

  async function runProgram(nextSource = source) {
    setIsRunning(true);
    setActivePanel('output');
    const id = uuid();
    setRunId(id);
    const execution = await runNova(nextSource, {
      breakpoints,
      input: async (promptText) => window.prompt(promptText || 'NovaLang input') || ''
    });
    setResult(execution);
    setTimelineCursor(0);
    setIsRunning(false);
  }

  async function runRepl(snippet) {
    const execution = await runNova(snippet, {
      input: async (promptText) => window.prompt(promptText || 'NovaLang input') || ''
    });
    setReplLog((items) => [
      ...items,
      {
        id: uuid(),
        source: snippet,
        output: execution.output,
        errors: execution.errors
      }
    ]);
    setActivePanel('repl');
  }

  function clearConsole() {
    setResult((current) => ({ ...current, output: [], errors: [] }));
    setReplLog([]);
  }

  function saveProgram() {
    localStorage.setItem(STORAGE_KEY, source);
  }

  function downloadSource() {
    saveAs(new Blob([source], { type: 'text/plain;charset=utf-8' }), 'program.nova');
  }

  function openProgram(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setSource(text);
      localStorage.setItem(STORAGE_KEY, text);
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function loadExample(example) {
    setSource(example.source);
    localStorage.setItem(STORAGE_KEY, example.source);
    setResult({ ok: true, output: [], errors: [], tokens: [], ast: null, timeline: [], memory: null });
  }

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar examples={examples} onSelect={loadExample} stats={stats} />

        <main className="flex min-w-0 flex-1 flex-col">
          <Toolbar
            isRunning={isRunning}
            runId={runId}
            breakpoints={breakpoints}
            onBreakpointsChange={setBreakpoints}
            onRun={() => runProgram()}
            onClear={clearConsole}
            onSave={saveProgram}
            onOpen={() => fileInputRef.current?.click()}
            onDownload={downloadSource}
          />
          <input ref={fileInputRef} className="hidden" type="file" accept=".nova,text/plain" onChange={openProgram} />

          <section className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(430px,0.65fr)]">
            <div className="min-h-[54vh] border-r border-line">
              <Editor source={source} onChange={setSource} diagnostics={result.errors} />
            </div>

            <div className="flex min-h-0 flex-col bg-panel">
              <Output
                activePanel={activePanel}
                onPanelChange={setActivePanel}
                result={result}
                source={source}
                replLog={replLog}
                timelineCursor={timelineCursor}
                onTimelineCursorChange={setTimelineCursor}
              />
              <Console onRun={runRepl} />
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {isRunning && (
          <motion.div
            className="fixed bottom-5 right-5 rounded border border-nova/40 bg-panelSoft px-4 py-3 text-sm text-nova shadow-glow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            Running NovaLang program...
          </motion.div>
        )}
      </AnimatePresence>

      <InspectorPanel result={result} cursor={timelineCursor} />
    </div>
  );
}
