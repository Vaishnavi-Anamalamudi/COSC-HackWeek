import { mergeElement, mergeElements } from '../utils/canvasUtils.js';

export function registerCanvasHandlers(io, socket, getRoom) {
  socket.on('draw', ({ roomId, element }) => {
    if (!roomId || !element?.id) return;
    const room = getRoom(roomId);
    const merged = mergeElement(room, element);
    socket.to(roomId).emit('draw', merged);
  });

  socket.on('erase', ({ roomId, elements }) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const merged = mergeElements(room, elements);
    socket.to(roomId).emit('erase', { elements: merged });
  });

  socket.on('clear-canvas', ({ roomId, elements }) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const merged = mergeElements(room, elements);
    socket.to(roomId).emit('clear-canvas', { elements: merged });
  });

  socket.on('undo', ({ roomId, elements }) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const merged = mergeElements(room, elements);
    socket.to(roomId).emit('undo', { elements: merged });
  });

  socket.on('redo', ({ roomId, elements }) => {
    if (!roomId) return;
    const room = getRoom(roomId);
    const merged = mergeElements(room, elements);
    socket.to(roomId).emit('redo', { elements: merged });
  });

  socket.on('cursor-move', (cursor) => {
    if (!cursor?.roomId) return;
    socket.to(cursor.roomId).emit('cursor-move', cursor);
  });
}
