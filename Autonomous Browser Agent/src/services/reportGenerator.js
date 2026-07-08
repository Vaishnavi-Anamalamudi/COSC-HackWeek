import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import XLSX from 'xlsx';
import { sanitizeFilename } from '../utils/browserHelpers.js';

function flattenTask(task) {
  return {
    id: task.id,
    command: task.command,
    status: task.status,
    currentUrl: task.currentUrl,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    progress: task.progress,
    summary: task.result?.summary || '',
    executionTimeMs: task.result?.executionTimeMs || 0,
    successRate: task.result?.successRate || 0,
    items: task.result?.items || [],
    screenshots: task.result?.screenshots || [],
    logs: task.logs || [],
    plan: task.plan || []
  };
}

function toCsv(rows = []) {
  if (!rows.length) return 'message\nNo extracted rows\n';
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))
  ].join('\n');
}

function toText(task) {
  const payload = flattenTask(task);
  const lines = [
    'WebPilot AI Report',
    `Task ID: ${payload.id}`,
    `Command: ${payload.command}`,
    `Status: ${payload.status}`,
    `URL: ${payload.currentUrl}`,
    `Started: ${payload.startedAt}`,
    `Finished: ${payload.finishedAt}`,
    `Execution Time: ${payload.executionTimeMs}ms`,
    `Success Rate: ${payload.successRate}%`,
    '',
    'Summary',
    payload.summary || 'No summary generated.',
    '',
    'Timeline',
    ...payload.plan.map((step) => `- ${step.label}: ${step.status} ${step.detail ? `(${step.detail})` : ''}`),
    '',
    'Extracted Items',
    ...payload.items.map((item, index) => `${index + 1}. ${Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(' | ')}`),
    '',
    'Logs',
    ...payload.logs.map((log) => `[${log.level}] ${log.message}`)
  ];

  return lines.join('\n');
}

function wrapText(text, width = 90) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    if ((line + word).length > width) {
      lines.push(line.trim());
      line = '';
    }
    line += `${word} `;
  }

  if (line.trim()) lines.push(line.trim());
  return lines;
}

async function toPdf(task) {
  const payload = flattenTask(task);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 744;

  const draw = (text, size = 10, useBold = false, color = rgb(0.92, 1, 0.96)) => {
    if (y < 64) {
      page = pdf.addPage([612, 792]);
      y = 744;
    }
    page.drawText(text, {
      x: 48,
      y,
      size,
      font: useBold ? bold : font,
      color
    });
    y -= size + 8;
  };

  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: rgb(0.02, 0.06, 0.05) });
  draw('WebPilot AI Report', 22, true, rgb(0.22, 1, 0.61));
  draw(`Command: ${payload.command}`, 11, false);
  draw(`Status: ${payload.status} | Success: ${payload.successRate}% | Time: ${payload.executionTimeMs}ms`, 10, false, rgb(0.72, 0.86, 0.78));
  y -= 8;
  draw('Summary', 14, true, rgb(0.22, 1, 0.61));
  wrapText(payload.summary || 'No summary generated.', 82).forEach((line) => draw(line, 10));
  y -= 8;
  draw('Timeline', 14, true, rgb(0.22, 1, 0.61));
  payload.plan.forEach((step) => draw(`${step.status.toUpperCase()} - ${step.label}`, 10));
  y -= 8;
  draw('Extracted Items', 14, true, rgb(0.22, 1, 0.61));
  payload.items.slice(0, 12).forEach((item, index) => {
    wrapText(`${index + 1}. ${Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(' | ')}`, 82)
      .forEach((line) => draw(line, 9));
  });

  return pdf.save();
}

async function toXlsx(task) {
  const payload = flattenTask(task);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{
    id: payload.id,
    command: payload.command,
    status: payload.status,
    summary: payload.summary,
    executionTimeMs: payload.executionTimeMs,
    successRate: payload.successRate
  }]), 'Summary');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(payload.items), 'Items');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function generateReport(task, format, reportDir) {
  await fs.mkdir(reportDir, { recursive: true });
  const safeName = `${sanitizeFilename(task.command)}-${task.id}`;
  const extension = format === 'xlsx' ? 'xlsx' : format;
  const filePath = path.join(reportDir, `${safeName}.${extension}`);

  if (format === 'json') {
    await fs.writeFile(filePath, JSON.stringify(flattenTask(task), null, 2));
  } else if (format === 'csv') {
    await fs.writeFile(filePath, toCsv(task.result?.items || []));
  } else if (format === 'txt') {
    await fs.writeFile(filePath, toText(task));
  } else if (format === 'xlsx') {
    await fs.writeFile(filePath, await toXlsx(task));
  } else {
    await fs.writeFile(filePath, await toPdf(task));
  }

  return filePath;
}
