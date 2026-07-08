import { AnimatePresence, motion } from 'framer-motion';
import ModernTemplate from '../templates/ModernTemplate';
import GlassTemplate from '../templates/GlassTemplate';
import CorporateTemplate from '../templates/CorporateTemplate';
import CyberpunkTemplate from '../templates/CyberpunkTemplate';

const templateComponents = {
  modern: ModernTemplate,
  glass: GlassTemplate,
  corporate: CorporateTemplate,
  cyberpunk: CyberpunkTemplate,
};

export default function CardShell({ card, accentColor, template, cardRef }) {
  const Template = templateComponents[template] || ModernTemplate;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto w-[720px] max-w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={template}
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="origin-top"
          >
            <div ref={cardRef} className="print-card overflow-hidden rounded-lg">
              <Template card={card} accentColor={accentColor} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
