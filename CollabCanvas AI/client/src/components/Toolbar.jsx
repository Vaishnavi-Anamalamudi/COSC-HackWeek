import { motion } from 'framer-motion';
import { TOOLS } from '../constants/tools.js';

export default function Toolbar({ tool, setTool, onClear, onImage }) {
  const tools = TOOLS.filter((item) => item.id !== 'clear');

  return (
    <motion.aside
      className="glass-panel absolute left-4 top-24 z-40 flex max-h-[calc(100vh-8rem)] w-14 flex-col items-center gap-1 overflow-y-auto rounded-2xl p-2"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {tools.map((item) => {
        const Icon = item.icon;
        const handleClick = () => {
          if (item.id === 'image') onImage();
          setTool(item.id);
        };
        return (
          <button
            className={`icon-button ${tool === item.id ? 'icon-button-active' : ''}`}
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={handleClick}
          >
            <Icon size={18} />
          </button>
        );
      })}
      <div className="my-1 h-px w-8 bg-slate-700" />
      <button className="icon-button text-rose-300" type="button" title="Clear canvas" aria-label="Clear canvas" onClick={onClear}>
        {(() => {
          const Icon = TOOLS.find((item) => item.id === 'clear').icon;
          return <Icon size={18} />;
        })()}
      </button>
    </motion.aside>
  );
}
