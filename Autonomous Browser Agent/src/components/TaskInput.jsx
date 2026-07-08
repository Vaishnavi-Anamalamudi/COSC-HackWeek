import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMic, FiSend, FiStopCircle } from 'react-icons/fi';
import { EXAMPLE_COMMANDS } from '../constants/commands.js';

export default function TaskInput({ onSubmit, onStop, busy }) {
  const [command, setCommand] = useState('');
  const [listening, setListening] = useState(false);

  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = 'en-IN';
    return instance;
  }, []);

  const submit = (event) => {
    event.preventDefault();
    if (!command.trim() || busy) return;
    onSubmit(command);
  };

  const startVoice = () => {
    if (!recognition) return;
    setListening(true);
    recognition.onresult = (event) => {
      setCommand(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <motion.section
      className="glass-panel rounded-lg p-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-pilot-text">Natural Language Command</h2>
            <p className="text-sm text-pilot-muted">Give WebPilot a browser task and watch it execute.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Voice command"
              onClick={startVoice}
              disabled={!recognition || busy}
              className={`grid h-10 w-10 place-items-center rounded-md border border-pilot-line ${listening ? 'bg-pilot-green text-black' : 'bg-white/5 text-pilot-mint'} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <FiMic />
            </button>
            {busy && (
              <button
                type="button"
                title="Stop task"
                onClick={onStop}
                className="grid h-10 w-10 place-items-center rounded-md border border-red-300/30 bg-red-500/12 text-red-200"
              >
                <FiStopCircle />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <textarea
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="Example: Open GitHub and search for Spring Boot repositories."
            className="min-h-24 flex-1 resize-none rounded-lg border border-pilot-line bg-black/24 p-4 text-sm text-pilot-text placeholder:text-pilot-muted"
          />
          <button
            type="submit"
            disabled={busy || !command.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-pilot-green px-5 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 lg:w-40"
          >
            <FiSend />
            Run Agent
          </button>
        </div>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {EXAMPLE_COMMANDS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCommand(item)}
            className="shrink-0 rounded-full border border-pilot-line bg-white/5 px-3 py-2 text-xs text-pilot-muted transition hover:border-pilot-green hover:text-pilot-text"
          >
            {item}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
