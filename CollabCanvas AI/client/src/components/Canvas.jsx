import { useCallback, useEffect, useRef } from 'react';
import Cursor from './Cursor.jsx';
import { drawElement } from '../utils/draw.js';

export default function Canvas({
  elements,
  cursors,
  viewport,
  canvasApi,
  boardRef,
  activeTool,
  darkMode
}) {
  const canvasRef = useRef(null);
  const imageCacheRef = useRef({});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = darkMode ? '#ffffff' : '#ffffff';
    ctx.fillRect(viewport.x, viewport.y, 3600 * viewport.zoom, 2400 * viewport.zoom);
    for (const element of elements) {
      drawElement(ctx, element, viewport, imageCacheRef.current);
    }
  }, [darkMode, elements, viewport]);

  useEffect(() => {
    let mounted = true;
    for (const element of elements) {
      if (element.type !== 'image' || !element.src || imageCacheRef.current[element.id]) continue;
      const image = new Image();
      image.onload = () => {
        imageCacheRef.current[element.id] = image;
        if (mounted) draw();
      };
      image.src = element.src;
    }
    return () => {
      mounted = false;
    };
  }, [draw, elements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const parent = canvas.parentElement;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * ratio;
      canvas.height = parent.clientHeight * ratio;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      draw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  useEffect(() => {
    let frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [draw]);

  function handleDrop(event) {
    event.preventDefault();
    const file = [...event.dataTransfer.files].find((item) => item.type.startsWith('image/'));
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => canvasApi.addImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  const cursorStyle = activeTool === 'pan' ? 'grab' : activeTool === 'laser' ? 'crosshair' : 'default';

  return (
    <section
      ref={boardRef}
      className="canvas-shell relative min-h-0 flex-1 overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      style={{ cursor: cursorStyle }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onPointerDown={canvasApi.pointerDown}
        onPointerMove={canvasApi.pointerMove}
        onPointerUp={canvasApi.pointerUp}
        onPointerCancel={canvasApi.pointerUp}
      />
      {Object.values(cursors).map((cursor) => (
        <Cursor cursor={cursor} viewport={viewport} key={cursor.userId} />
      ))}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-slate-300/70 bg-white/85 px-4 py-2 text-xs font-semibold text-slate-700 shadow-soft backdrop-blur">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </section>
  );
}
