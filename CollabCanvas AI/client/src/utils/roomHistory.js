import { ROOM_HISTORY_KEY } from '../constants/tools.js';

export function getRoomHistory() {
  try {
    return JSON.parse(localStorage.getItem(ROOM_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRoomVisit(roomId) {
  const next = [
    { roomId, visitedAt: new Date().toISOString() },
    ...getRoomHistory().filter((item) => item.roomId !== roomId)
  ].slice(0, 8);
  localStorage.setItem(ROOM_HISTORY_KEY, JSON.stringify(next));
  return next;
}
