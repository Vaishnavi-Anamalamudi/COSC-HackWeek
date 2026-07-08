import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FiCheck } from 'react-icons/fi';
import BrushSettings from '../components/BrushSettings.jsx';
import Canvas from '../components/Canvas.jsx';
import ExportPanel from '../components/ExportPanel.jsx';
import Navbar from '../components/Navbar.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import Toolbar from '../components/Toolbar.jsx';
import { USER_KEY } from '../constants/tools.js';
import { useCanvas } from '../hooks/useCanvas.js';
import { useSocket } from '../hooks/useSocket.js';
import { exportBoard } from '../utils/exportCanvas.js';
import { saveRoomVisit } from '../utils/roomHistory.js';

const fallbackUser = {
  id: uuid(),
  name: `Guest ${Math.floor(Math.random() * 900 + 100)}`,
  color: '#22C55E'
};

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null') || fallbackUser;
  } catch {
    return fallbackUser;
  }
}

export default function Room({ roomId }) {
  const [user] = useState(readUser);
  const [tool, setTool] = useState('pencil');
  const [brush, setBrush] = useState({ color: '#111827', size: 4, opacity: 1 });
  const [darkMode, setDarkMode] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const boardRef = useRef(null);
  const imageInputRef = useRef(null);
  const socketApi = useSocket(roomId, user);
  const canvasApi = useCanvas({ roomId, user, socketApi, tool, brush, snapToGrid });

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    saveRoomVisit(roomId);
  }, [roomId, user]);

  useEffect(() => {
    const handleKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        canvasApi.undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        canvasApi.redo();
      }
      if (event.key === 'Escape') setTool('select');
      if (event.key.toLowerCase() === 'v') setTool('select');
      if (event.key.toLowerCase() === 'p') setTool('pencil');
      if (event.key.toLowerCase() === 'b') setTool('brush');
      if (event.key.toLowerCase() === 'e') setTool('eraser');
      if (event.key.toLowerCase() === 't') setTool('text');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canvasApi]);

  const inviteLink = useMemo(() => `${window.location.origin}/room/${roomId}`, [roomId]);

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  async function handleExport(format) {
    await exportBoard(boardRef.current, format, roomId);
    setExportOpen(false);
  }

  function uploadImage() {
    imageInputRef.current?.click();
  }

  function handleImageFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => canvasApi.addImage(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function fullscreen() {
    document.documentElement.requestFullscreen?.();
  }

  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <main className="relative flex h-screen flex-col overflow-hidden bg-ink text-white">
        <Navbar
          roomId={roomId}
          connected={socketApi.connected}
          participants={socketApi.participants}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onInvite={copyInvite}
          onExport={() => setExportOpen(true)}
          onUndo={canvasApi.undo}
          onRedo={canvasApi.redo}
          onZoomIn={() => canvasApi.zoomBy(0.1)}
          onZoomOut={() => canvasApi.zoomBy(-0.1)}
          onResetView={canvasApi.resetView}
          onFullscreen={fullscreen}
          canUndo={canvasApi.canUndo}
          canRedo={canvasApi.canRedo}
        />
        <div className="relative flex min-h-0 flex-1 gap-4 p-4">
          <Toolbar tool={tool} setTool={setTool} onClear={canvasApi.clearCanvas} onImage={uploadImage} />
          <input ref={imageInputRef} className="hidden" type="file" accept="image/*" onChange={handleImageFile} />
          <Canvas
            elements={canvasApi.elements}
            cursors={socketApi.cursors}
            viewport={canvasApi.viewport}
            canvasApi={canvasApi}
            boardRef={boardRef}
            activeTool={tool}
            darkMode={darkMode}
          />
          <RightSidebar
            user={user}
            participants={socketApi.participants}
            activity={socketApi.activity}
            messages={socketApi.messages}
            typingUsers={socketApi.typingUsers}
            onSendMessage={socketApi.sendMessage}
            onTyping={socketApi.sendTyping}
          />
          <BrushSettings brush={brush} setBrush={setBrush} snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid} />
        </div>
        {copied && (
          <div className="absolute left-1/2 top-20 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-ink shadow-soft">
            <FiCheck /> Invite link copied
          </div>
        )}
        <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} onExport={handleExport} />
      </main>
    </div>
  );
}
