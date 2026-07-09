import { motion } from 'framer-motion';
import { FaPalette } from 'react-icons/fa6';
import ImageUploader from './ImageUploader';
import { formFields } from '../utils/cardFields';

export default function CardForm({ card, accentColor, onAccentChange, onCardChange }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-lg border border-white/10 bg-panel/86 p-4 shadow-card backdrop-blur md:p-5"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-white md:text-3xl">
            Digital Business Card
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Design a crisp card, generate a QR destination, and export it for sharing or print.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200">
          <FaPalette style={{ color: accentColor }} />
          <span>Accent</span>
          <input
            type="color"
            value={accentColor}
            onChange={(event) => onAccentChange(event.target.value)}
            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
            aria-label="Choose accent color"
          />
        </label>
      </div>

      <div className="space-y-5">
        <ImageUploader image={card.profileImage} onChange={(value) => onCardChange('profileImage', value)} />

        <div className="grid gap-4 sm:grid-cols-2">
          {formFields.map((field) => {
            const Icon = field.icon;

            return (
              <label key={field.name} className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <Icon className="text-zinc-500" />
                  {field.label}
                  {field.required && <span className="text-accent">*</span>}
                </span>
                <input
                  type={field.type || 'text'}
                  value={card[field.name]}
                  onChange={(event) => onCardChange(field.name, event.target.value)}
                  placeholder={field.label}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-accent/80 focus:ring-4 focus:ring-accent/10"
                />
              </label>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
