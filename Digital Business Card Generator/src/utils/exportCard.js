const exportOptions = {
  cacheBust: true,
  pixelRatio: 3,
  backgroundColor: '#050807',
  style: {
    transform: 'scale(1)',
    transformOrigin: 'top left',
  },
};

export async function exportCardAsPng(node, fileName) {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(node, exportOptions);
  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportCardAsPdf(node, fileName) {
  const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
  const dataUrl = await toPng(node, exportOptions);
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [720, 420],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, 720, 420);
  pdf.save(`${fileName}.pdf`);
}

export function getExportFileName(fullName) {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug || 'business-card'}-card`;
}
