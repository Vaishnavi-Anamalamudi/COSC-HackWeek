import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generateReport } from '../../services/reportGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageRoot = path.resolve(__dirname, '../storage');
const uploadDir = path.join(storageRoot, 'uploads');
const reportDir = path.join(storageRoot, 'reports');

const upload = multer({ dest: uploadDir });

export function createAgentRouter(agentService) {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'WebPilot AI',
      browser: 'Playwright Chromium',
      time: new Date().toISOString()
    });
  });

  router.post('/run', async (req, res, next) => {
    try {
      const command = String(req.body.command || '').trim();
      if (!command) {
        res.status(400).json({ error: 'Command is required.' });
        return;
      }
      const task = agentService.createTask(command, req.body.options || {});
      res.status(202).json({ task });
    } catch (error) {
      next(error);
    }
  });

  router.get('/tasks/:id', (req, res) => {
    const task = agentService.getTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json({ task });
  });

  router.post('/tasks/:id/stop', async (req, res) => {
    const task = await agentService.stopTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json({ task });
  });

  router.post('/tasks/:id/replay', (req, res) => {
    const task = agentService.replayTask(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.status(202).json({ task });
  });

  router.get('/history', (_req, res) => {
    res.json({ tasks: agentService.listTasks() });
  });

  router.post('/upload', upload.single('file'), (req, res) => {
    res.status(201).json({
      file: {
        id: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      }
    });
  });

  router.get('/reports/:id/:format', async (req, res, next) => {
    try {
      const task = agentService.getTask(req.params.id);
      const format = req.params.format.toLowerCase();
      const allowed = new Set(['pdf', 'json', 'csv', 'txt', 'xlsx']);
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      if (!allowed.has(format)) {
        res.status(400).json({ error: 'Unsupported report format.' });
        return;
      }

      await fs.mkdir(reportDir, { recursive: true });
      const filePath = await generateReport(task, format, reportDir);
      res.download(filePath);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
