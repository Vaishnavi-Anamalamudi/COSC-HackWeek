import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(express.json({ limit: '2mb' }));
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'ChronoVault AI API',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/ai/summary', (req, res) => {
  const { title = 'Untitled capsule', message = '', mediaCount = 0 } = req.body || {};
  const preview = message.replace(/\s+/g, ' ').trim().slice(0, 180);
  res.json({
    summary: `${title} preserves ${mediaCount} media item${mediaCount === 1 ? '' : 's'} with a note that begins: ${preview || 'a private future memory.'}`,
  });
});

app.post('/api/reminders/preview', (req, res) => {
  const { email, unlockAt, title } = req.body || {};
  if (!email || !unlockAt || !title) {
    return res.status(400).json({ error: 'email, unlockAt, and title are required' });
  }
  return res.json({
    queued: true,
    message: `Reminder preview queued for ${email} before ${title} unlocks on ${unlockAt}.`,
  });
});

app.listen(port, () => {
  console.log(`ChronoVault AI API listening on http://localhost:${port}`);
});
