const STORAGE_KEY = 'taskflow-pro-state-v1';

export function loadState(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed?.boards?.length ? parsed : fallback;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function validateImport(payload) {
  return Boolean(payload && Array.isArray(payload.boards) && payload.boards.length && payload.activeBoardId);
}
