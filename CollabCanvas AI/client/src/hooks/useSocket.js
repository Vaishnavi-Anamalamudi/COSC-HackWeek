import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export function useSocket(roomId, user) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [cursors, setCursors] = useState({});
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const handlersRef = useRef({});

  useEffect(() => {
    if (!roomId || !user?.id) return undefined;

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 450,
      timeout: 12000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { roomId, user });
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('room-state', (state) => {
      setParticipants(state.participants || []);
      setMessages(state.messages || []);
      handlersRef.current.onRoomState?.(state);
    });
    socket.on('user-connected', ({ participants: nextParticipants, activity: entry }) => {
      setParticipants(nextParticipants || []);
      setActivity((items) => [entry, ...items].slice(0, 40));
    });
    socket.on('user-disconnected', ({ participants: nextParticipants, userId, activity: entry }) => {
      setParticipants(nextParticipants || []);
      setCursors((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      setActivity((items) => [entry, ...items].slice(0, 40));
    });
    socket.on('draw', (element) => handlersRef.current.onRemoteElement?.(element));
    socket.on('erase', (payload) => handlersRef.current.onRemoteErase?.(payload));
    socket.on('clear-canvas', (payload) => handlersRef.current.onRemoteClear?.(payload));
    socket.on('undo', (payload) => handlersRef.current.onRemoteUndo?.(payload));
    socket.on('redo', (payload) => handlersRef.current.onRemoteRedo?.(payload));
    socket.on('cursor-move', (cursor) => {
      if (cursor.userId === user.id) return;
      setCursors((current) => ({ ...current, [cursor.userId]: cursor }));
    });
    socket.on('chat-message', (message) => {
      setMessages((items) => [...items, message].slice(-120));
    });
    socket.on('typing', ({ userId, name, isTyping }) => {
      if (userId === user.id) return;
      setTypingUsers((items) => {
        const without = items.filter((item) => item.userId !== userId);
        return isTyping ? [...without, { userId, name }] : without;
      });
    });

    return () => {
      socket.emit('leave-room', { roomId, userId: user.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, user]);

  const api = useMemo(
    () => ({
      get socket() {
        return socketRef.current;
      },
      connected,
      participants,
      cursors,
      messages,
      activity,
      typingUsers,
      setHandlers(handlers) {
        handlersRef.current = handlers;
      },
      emit(event, payload) {
        socketRef.current?.emit(event, payload);
      },
      sendCursor(cursor) {
        socketRef.current?.emit('cursor-move', { roomId, ...cursor });
      },
      sendMessage(message) {
        socketRef.current?.emit('chat-message', { roomId, message });
      },
      sendTyping(isTyping) {
        socketRef.current?.emit('typing', { roomId, userId: user.id, name: user.name, isTyping });
      }
    }),
    [activity, connected, cursors, messages, participants, roomId, typingUsers, user]
  );

  return api;
}
