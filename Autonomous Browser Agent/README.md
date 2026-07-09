# WebPilot AI

WebPilot AI is an autonomous browser agent dashboard built with React 19, Vite, Tailwind CSS, Framer Motion, Express, WebSockets, and Playwright Chromium.

It accepts natural language commands, creates a browser plan, executes browser actions, streams live screenshots and logs, extracts data, handles common failures with retries, and exports task reports.

## Features

- Natural language command input with local parser fallback and optional OpenAI-compatible planner.
- Playwright browser automation for navigation, typing, clicking, scrolling, downloads, screenshots, dialogs, and retries.
- Real-time dashboard with live browser screenshot preview, current URL, action state, progress, timeline, and logs.
- Supported demos for Google search, YouTube search, GitHub search, Wikipedia lookup, weather/currency search, product search, headlines, registration forms, and dummy appointment booking.
- Human-in-the-loop CAPTCHA detection. The agent reports manual verification instead of bypassing it.
- Export completed tasks as PDF, JSON, CSV, TXT, or XLSX.
- Voice command input through browser Speech Recognition when supported.
- History and task replay.

## Quick Start

```bash
npm install
npx playwright install chromium
npm run dev
```

Open the Vite app at:

```text
http://localhost:5175
```

The Express API runs at:

```text
http://localhost:8787
```

## Environment

Copy `.env.example` to `.env` and adjust as needed.

```text
PORT=8787
HEADLESS=false
BROWSER_SLOW_MO=80
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
MAX_AGENT_STEPS=8
```

If `OPENAI_API_KEY` is empty, WebPilot AI uses the built-in deterministic parser.

## Folder Structure

```text
src/
  components/
    BrowserView.jsx
    TaskInput.jsx
    Timeline.jsx
    Logs.jsx
    ResultPanel.jsx
    History.jsx
    Settings.jsx
  pages/
    Dashboard.jsx
  hooks/
    useAgent.js
  services/
    playwrightService.js
    taskPlanner.js
    reportGenerator.js
  utils/
    browserHelpers.js
  constants/
    commands.js
  server/
    index.js
    routes/
      agent.js
```

## API

- `POST /api/agent/run` starts a task with `{ "command": "Search React tutorials on YouTube" }`.
- `GET /api/agent/tasks/:id` returns a task.
- `POST /api/agent/tasks/:id/stop` stops a task.
- `POST /api/agent/tasks/:id/replay` reruns a previous command.
- `GET /api/agent/history` lists recent tasks.
- `GET /api/agent/reports/:id/:format` downloads `pdf`, `json`, `csv`, `txt`, or `xlsx`.
- `WS /ws` streams task updates.

## Production Build

```bash
npm run build
npm start
```

In production mode, Express serves the Vite build from `dist`.

## Demo Commands

```text
Search for React tutorials on YouTube.
Open GitHub and search for Spring Boot.
Search today weather in Mumbai.
Compare iPhone 16 and Samsung S25.
Find the cheapest laptop under 50000.
Fill this registration form.
Book a dummy appointment.
Collect latest technology headlines.
```
