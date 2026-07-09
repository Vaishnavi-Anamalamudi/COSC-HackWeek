import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { registerCanvasHandlers } from './socket/canvasHandler.js';
import { registerChatHandlers } from './socket/chatHandler.js';
import { registerPresenceHandlers } from './socket/presenceHandler.js';
import { createRoomState, serializeRoom } from './utils/canvasUtils.js';

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, createRoomState(roomId));
  return rooms.get(roomId);
}

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, rooms: rooms.size, uptime: process.uptime() });
});

app.get('/api/rooms/:roomId', (req, res) => {
  res.json(serializeRoom(getRoom(req.params.roomId)));
});

app.post('/api/rooms', (_req, res) => {
  const roomId = crypto.randomUUID();
  const room = getRoom(roomId);
  res.status(201).json(serializeRoom(room));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

io.on('connection', (socket) => {
  registerPresenceHandlers(io, socket, rooms, getRoom);
  registerCanvasHandlers(io, socket, getRoom);
  registerChatHandlers(io, socket, getRoom);
});

server.listen(PORT, () => {
  console.log(`CollabCanvas AI server listening on :${PORT}`);
});
