# CollabCanvas AI

CollabCanvas AI is a production-ready collaborative whiteboard inspired by Excalidraw and Miro. It uses React, Vite, Tailwind CSS, HTML5 Canvas, Express, and Socket.IO to provide room-based realtime drawing, live cursors, presence, chat, autosave, and export tools.

## Features

- Realtime rooms with UUID room IDs and invite links
- Pencil, brush, highlighter, eraser, line, arrow, rectangle, circle, ellipse, text, sticky notes, image upload, lasso, laser pointer, and pan tools
- Smooth canvas rendering with `requestAnimationFrame`
- Throttled stroke synchronization to reduce network traffic
- Conflict-aware element merging using element IDs and versions
- Live cursors with names and colors
- Connected user list, join/leave activity, typing indicators, and chat history
- Undo, redo, clear canvas, zoom, pan, reset view, fullscreen, snap to grid, and autosave
- PNG, JPEG, and PDF export with `html2canvas`, `jsPDF`, and `FileSaver.js`
- Dark/light mode UI with a professional whiteboard layout
- Landing page, onboarding, sample demo room, loading screen, and room history

## Architecture

```text
React 19 + Canvas
        |
Socket.IO Client
        |
Express + Socket.IO Server
        |
Room State: elements, users, cursors, messages
        |
Broadcast draw / cursor / chat / presence events
        |
All connected clients merge versioned updates
```

## Folder Structure

```text
client/
  src/
    components/
      Canvas.jsx
      Toolbar.jsx
      ColorPicker.jsx
      BrushSettings.jsx
      Participants.jsx
      Chat.jsx
      ExportPanel.jsx
      Navbar.jsx
      Cursor.jsx
    hooks/
      useSocket.js
      useCanvas.js
    pages/
      Home.jsx
      Room.jsx
server/
  index.js
  socket/
    canvasHandler.js
    chatHandler.js
    presenceHandler.js
  utils/
    canvasUtils.js
constants/
  tools.js
```

## Local Setup

```bash
cd "CollabCanvas AI"
npm install
npm run install:all
npm run dev
```

The client runs at `http://localhost:5174`.
The server runs at `http://localhost:4000`.

Open `http://localhost:5174/room/demo-judges-room` in two browser windows to test live collaboration.

## Environment Variables

Client:

```bash
VITE_SOCKET_URL=http://localhost:4000
```

Server:

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5174
```

## Socket Events

- `join-room`
- `leave-room`
- `draw`
- `erase`
- `clear-canvas`
- `undo`
- `redo`
- `cursor-move`
- `chat-message`
- `typing`
- `user-connected`
- `user-disconnected`

## Deployment

### Frontend on Netlify or Vercel

1. Set the project root to `client`.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `VITE_SOCKET_URL` pointing to the deployed backend.

### Backend on Render or Railway

1. Set the project root to `server`.
2. Start command: `npm run start`
3. Add `CLIENT_ORIGIN` with the deployed frontend origin.
4. Add `PORT` only if your provider does not inject it automatically.

## Screenshots

Add screenshots after running the app:

- `docs/screenshots/landing.png`
- `docs/screenshots/room.png`
- `docs/screenshots/collaboration.png`

## Production Notes

The current room store is in-memory for low-friction hackathon judging. For production persistence, replace the `rooms` map in `server/index.js` with Redis, Postgres, or a CRDT-backed document store. The frontend state is already versioned per element, so the storage layer can persist the same element model.
