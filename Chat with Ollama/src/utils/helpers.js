import { formatDistanceToNow } from "date-fns";

export function nowIso() {
  return new Date().toISOString();
}

export function relativeTime(value) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function titleFromText(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New chat";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned;
}

export function countTokens(text = "") {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.35));
}

export function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function safeModelName(model) {
  return model?.name || model?.model || String(model || "");
}
