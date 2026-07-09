import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CardForm from './components/CardForm';
import PreviewPanel from './components/PreviewPanel';
import { useCardState } from './hooks/useCardState';
import { exportCardAsPdf, exportCardAsPng, getExportFileName } from './utils/exportCard';

export default function App() {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const {
    accentColor,
    canDownload,
    card,
    missingFields,
    setAccentColor,
    setTemplate,
    setTouchedDownloads,
    template,
    touchedDownloads,
    updateCard,
  } = useCardState();

  const exportCard = async (format) => {
    setTouchedDownloads(true);

    if (!canDownload || !cardRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const fileName = getExportFileName(card.fullName);
      if (format === 'pdf') {
        await exportCardAsPdf(cardRef.current, fileName);
      } else {
        await exportCardAsPng(cardRef.current, fileName);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <CardForm
          accentColor={accentColor}
          card={card}
          onAccentChange={setAccentColor}
          onCardChange={updateCard}
        />

        <PreviewPanel
          accentColor={accentColor}
          canDownload={canDownload}
          card={card}
          cardRef={cardRef}
          isExporting={isExporting}
          missingFields={missingFields}
          onExportPdf={() => exportCard('pdf')}
          onExportPng={() => exportCard('png')}
          onTemplateChange={setTemplate}
          showErrors={touchedDownloads}
          template={template}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mx-auto mt-6 max-w-[1500px] text-center text-xs text-zinc-600"
      >
        Required fields are marked with a green asterisk.
      </motion.p>
    </main>
  );
}
