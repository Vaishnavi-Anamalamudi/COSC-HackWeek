export async function exportBoard(container, format, roomId) {
  if (!container) return;
  const [{ default: html2canvas }, { saveAs }] = await Promise.all([import('html2canvas'), import('file-saver')]);
  const canvas = await html2canvas(container, {
    backgroundColor: '#ffffff',
    useCORS: true,
    scale: 2
  });

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const image = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${roomId}-whiteboard.pdf`);
    return;
  }

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  canvas.toBlob((blob) => {
    if (blob) saveAs(blob, `${roomId}-whiteboard.${format === 'jpeg' ? 'jpg' : 'png'}`);
  }, mime, 0.94);
}
