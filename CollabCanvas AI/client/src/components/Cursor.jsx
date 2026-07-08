import { motion } from 'framer-motion';
import { worldToScreen } from '../utils/draw.js';

export default function Cursor({ cursor, viewport }) {
  const position = worldToScreen({ x: cursor.x, y: cursor.y }, viewport);

  return (
    <motion.div
      className="pointer-events-none absolute z-30"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 2L18 11L11 13L8 20L3 2Z" fill={cursor.color} stroke="#ffffff" strokeWidth="1.4" />
      </svg>
      <span className="ml-4 rounded-full px-2 py-1 text-xs font-semibold text-white shadow-soft" style={{ background: cursor.color }}>
        {cursor.name}
      </span>
    </motion.div>
  );
}
