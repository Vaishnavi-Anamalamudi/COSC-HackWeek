import { motion } from 'framer-motion';
import CardShell from './CardShell';
import ExportActions from './ExportActions';
import TemplateSwitcher from './TemplateSwitcher';

export default function PreviewPanel({
  accentColor,
  canDownload,
  card,
  cardRef,
  isExporting,
  missingFields,
  onExportPdf,
  onExportPng,
  onTemplateChange,
  showErrors,
  template,
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
      className="space-y-4 lg:sticky lg:top-6 lg:self-start"
    >
      <section className="rounded-lg border border-white/10 bg-panel/86 p-4 shadow-card backdrop-blur md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Live Preview</h2>
            <p className="text-sm text-zinc-400">Social-ready 720 x 420 export canvas.</p>
          </div>
          <div
            className="h-3 w-3 rounded-full shadow-glow"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          />
        </div>

        <CardShell card={card} accentColor={accentColor} template={template} cardRef={cardRef} />
      </section>

      <section className="rounded-lg border border-white/10 bg-panel/86 p-4 shadow-card backdrop-blur md:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Template</h2>
          <p className="text-sm text-zinc-400">Switch styles without losing your card details.</p>
        </div>
        <TemplateSwitcher
          activeTemplate={template}
          accentColor={accentColor}
          onChange={onTemplateChange}
        />
      </section>

      <section className="rounded-lg border border-white/10 bg-panel/86 p-4 shadow-card backdrop-blur md:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Download</h2>
          <p className="text-sm text-zinc-400">PNG for social, PDF for polished printing.</p>
        </div>
        <ExportActions
          canDownload={canDownload}
          isExporting={isExporting}
          missingFields={missingFields}
          onExportPdf={onExportPdf}
          onExportPng={onExportPng}
          showErrors={showErrors}
        />
      </section>
    </motion.aside>
  );
}
