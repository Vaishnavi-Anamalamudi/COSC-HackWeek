import { addActivity, serializeRoom } from '../utils/canvasUtils.js';

export function registerPresenceHandlers(io, socket, rooms, getRoom) {
  socket.on('join-room', ({ roomId, user }) => {
    if (!roomId || !user?.id) return;
    const room = getRoom(roomId);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userId = user.id;
    socket.data.user = user;
    room.users.set(user.id, {
      id: user.id,
      name: user.name || 'Anonymous',
      color: user.color || '#22C55E',
      socketId: socket.id,
      joinedAt: new Date().toISOString()
    });
    const activity = addActivity(room, user.name || 'Anonymous', 'joined the room');
    socket.emit('room-state', serializeRoom(room));
    socket.to(roomId).emit('user-connected', {
      participants: [...room.users.values()],
      activity
    });
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    leaveRoom(io, socket, rooms, roomId, userId);
  });

  socket.on('disconnect', () => {
    leaveRoom(io, socket, rooms, socket.data.roomId, socket.data.userId);
  });
}

function leaveRoom(io, socket, rooms, roomId, userId) {
  if (!roomId || !userId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  const user = room.users.get(userId);
  room.users.delete(userId);
  socket.leave(roomId);
  const activity = addActivity(room, user?.name || 'Someone', 'left the room');
  io.to(roomId).emit('user-disconnected', {
    userId,
    participants: [...room.users.values()],
    activity
  });
}
