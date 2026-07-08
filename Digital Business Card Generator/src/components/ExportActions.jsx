import { FaFilePdf, FaImage } from 'react-icons/fa6';

const missingLabels = {
  fullName: 'full name',
  designation: 'designation',
  email: 'email',
};

export default function ExportActions({
  canDownload,
  isExporting,
  missingFields,
  onExportPdf,
  onExportPng,
  showErrors,
}) {
  const errorText = missingFields.map((field) => missingLabels[field] || field).join(', ');

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onExportPng}
          disabled={isExporting}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-black shadow-glow transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-55"
        >
          <FaImage />
          PNG
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExporting}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/10 disabled:translate-y-0 disabled:opacity-55"
        >
          <FaFilePdf />
          PDF
        </button>
      </div>

      {showErrors && !canDownload && (
        <p className="mt-3 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          Add {errorText} before downloading.
        </p>
      )}
    </div>
  );
}
