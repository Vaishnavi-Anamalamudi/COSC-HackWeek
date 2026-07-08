import { motion } from 'framer-motion';
import { simulationModes } from '../constants/simulationModes';

export default function SimulationSelector({ selectedMode, onChange }) {
  return (
    <section className="glass-panel p-4" aria-labelledby="simulation-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="simulation-heading" className="panel-heading">Simulation Mode</h2>
        <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent">Live</span>
      </div>
      <div className="space-y-2" role="radiogroup" aria-label="Color blindness simulation modes">
        {simulationModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = mode.id === selectedMode;
          return (
            <motion.button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`mode-card ${isSelected ? 'mode-card-active' : ''}`}
              onClick={() => onChange(mode.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-accent">
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-semibold text-text">{mode.label}</span>
                <span className="mt-1 block text-xs leading-4 text-slate-400">{mode.description}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
