import { motion } from 'framer-motion';
import { FaBuilding, FaCube, FaLayerGroup, FaWandMagicSparkles } from 'react-icons/fa6';

export const templates = [
  { id: 'modern', name: 'Modern', icon: FaLayerGroup },
  { id: 'glass', name: 'Glassmorphism', icon: FaWandMagicSparkles },
  { id: 'corporate', name: 'Corporate', icon: FaBuilding },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: FaCube },
];

export default function TemplateSwitcher({ activeTemplate, onChange, accentColor }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {templates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={[
              'relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg border px-3 text-sm font-semibold transition',
              isActive
                ? 'border-transparent text-black'
                : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white',
            ].join(' ')}
          >
            {isActive && (
              <motion.span
                layoutId="active-template-pill"
                className="absolute inset-0"
                style={{ backgroundColor: accentColor }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex min-w-0 items-center gap-2">
              <Icon className="shrink-0" />
              <span className="truncate">{template.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
