import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { createAgentRouter } from './routes/agent.js';
import { PlaywrightAgentService } from '../services/playwrightService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const storageRoot = path.join(__dirname, 'storage');
const app = express();
const port = Number(process.env.PORT || 8787);
const agentService = new PlaywrightAgentService();

await fs.mkdir(path.join(storageRoot, 'screenshots'), { recursive: true });
await fs.mkdir(path.join(storageRoot, 'reports'), { recursive: true });
await fs.mkdir(path.join(storageRoot, 'uploads'), { recursive: true });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/screenshots', express.static(path.join(storageRoot, 'screenshots')));
app.use('/reports', express.static(path.join(storageRoot, 'reports')));
app.use('/uploads', express.static(path.join(storageRoot, 'uploads')));
app.use('/api/agent', createAgentRouter(agentService));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(rootDir, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(rootDir, 'dist', 'index.html')));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Internal server error.' });
});

const server = app.listen(port, () => {
  console.log(`WebPilot AI server running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

wss.on('connection', (socket) => {
  clients.add(socket);
  socket.send(JSON.stringify({
    type: 'connected',
    task: null,
    serverTime: new Date().toISOString()
  }));
  socket.on('close', () => clients.delete(socket));
});

agentService.on('task:update', (payload) => {
  const message = JSON.stringify({ type: 'task:update', ...payload });
  for (const client of clients) {
    if (client.readyState === client.OPEN) client.send(message);
  }
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
