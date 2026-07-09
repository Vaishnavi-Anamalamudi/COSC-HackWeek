import { jsPDF } from 'jspdf';

export const exportSimulationPDF = ({ imageDataUrl, filename, title, details }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(248, 250, 252);
  doc.setFontSize(20);
  doc.text(title, 36, 44);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  details.forEach((line, index) => doc.text(line, 36, 66 + index * 15));

  doc.addImage(imageDataUrl, 'PNG', 36, 112, pageWidth - 72, pageHeight - 150, undefined, 'FAST');
  doc.save(filename);
};
