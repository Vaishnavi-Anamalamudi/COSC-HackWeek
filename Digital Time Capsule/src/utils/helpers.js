import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { addDays, differenceInCalendarDays, format, isAfter, isValid, parseISO } from 'date-fns';

export function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID,
  );
}

export function toDate(value) {
  if (!value) return new Date();
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(parsed) ? parsed : new Date();
}

export function validateUnlockDate(value) {
  const date = toDate(value);
  return isAfter(date, addDays(new Date(), -1)) && date.getTime() > Date.now() + 60 * 1000;
}

export function formatUnlock(value) {
  return format(toDate(value), 'MMM d, yyyy h:mm a');
}

export function getCapsuleStatus(capsule) {
  if (capsule.archived) return 'archived';
  return toDate(capsule.unlockAt).getTime() <= Date.now() ? 'unlocked' : 'locked';
}

export function daysUntil(value) {
  return Math.max(0, differenceInCalendarDays(toDate(value), new Date()));
}

export function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportElementToPdf(elementId, filename = 'chronovault-capsule.pdf') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Export target not found.');
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0B1120' });
  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight);
  pdf.save(filename);
}

export function classNames(...values) {
  return values.filter(Boolean).join(' ');
}
