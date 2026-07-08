export function registerChatHandlers(io, socket, getRoom) {
  socket.on('chat-message', ({ roomId, message }) => {
    if (!roomId || !message?.text) return;
    const room = getRoom(roomId);
    const stamped = {
      ...message,
      id: message.id || crypto.randomUUID(),
      createdAt: message.createdAt || new Date().toISOString()
    };
    room.messages.push(stamped);
    room.messages = room.messages.slice(-120);
    io.to(roomId).emit('chat-message', stamped);
  });

  socket.on('typing', ({ roomId, userId, name, isTyping }) => {
    if (!roomId || !userId) return;
    socket.to(roomId).emit('typing', { userId, name, isTyping: Boolean(isTyping) });
  });
}
