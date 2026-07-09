import { FaFileImage, FaFilePdf, FaImages } from 'react-icons/fa';
import { processImage } from '../utils/imageProcessor';
import { downloadDataUrl } from '../utils/exportPNG';

export default function DownloadPanel({ image, mode, intensity, simulatedSrc, selectedModeLabel }) {
  const disabled = !image;
  const baseName = image?.name?.replace(/\.[^/.]+$/, '') || 'simulation';

  const exportImage = async (type) => {
    if (!image) return;
    const mimeType = type === 'jpeg' ? 'image/jpeg' : 'image/png';
    const result = await processImage({ src: image.src, mode, intensity, mimeType });
    downloadDataUrl(result.src, `${baseName}-${mode}.${type === 'jpeg' ? 'jpg' : 'png'}`);
  };

  const exportPdf = async () => {
    if (!image) return;
    const { exportSimulationPDF } = await import('../utils/exportPDF');
    exportSimulationPDF({
      imageDataUrl: simulatedSrc,
      filename: `${baseName}-${mode}.pdf`,
      title: 'Color Blindness Simulation',
      details: [
        `Mode: ${selectedModeLabel}`,
        `Intensity: ${intensity}%`,
        `Image: ${image.name}`,
        `Dimensions: ${image.width} x ${image.height}`,
      ],
    });
  };

  const exportViewer = async () => {
    const node = document.querySelector('[data-export-viewer]');
    if (!node) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
    downloadDataUrl(dataUrl, `${baseName}-comparison.png`);
  };

  return (
    <section className="glass-panel p-4" aria-labelledby="download-heading">
      <h2 id="download-heading" className="panel-heading">Download</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="action-button" type="button" disabled={disabled} onClick={() => exportImage('png')}>
          <FaFileImage aria-hidden="true" />
          PNG
        </button>
        <button className="action-button" type="button" disabled={disabled} onClick={() => exportImage('jpeg')}>
          <FaFileImage aria-hidden="true" />
          JPEG
        </button>
        <button className="action-button" type="button" disabled={disabled} onClick={exportPdf}>
          <FaFilePdf aria-hidden="true" />
          PDF
        </button>
        <button className="action-button" type="button" disabled={disabled} onClick={exportViewer}>
          <FaImages aria-hidden="true" />
          View
        </button>
      </div>
    </section>
  );
}
