import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { DRAW_TOOLS, SHAPE_TOOLS } from '../constants/tools.js';
import { screenToWorld } from '../utils/draw.js';

const defaultViewport = { x: 80, y: 60, zoom: 1 };

function boardKey(roomId) {
  return `collabcanvas:board:${roomId}`;
}

function mergeElements(current, incoming) {
  const map = new Map(current.map((element) => [element.id, element]));
  for (const element of incoming) {
    const previous = map.get(element.id);
    if (!previous || (element.version || 0) >= (previous.version || 0)) {
      map.set(element.id, element);
    }
  }
  return [...map.values()].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export function useCanvas({ roomId, user, socketApi, tool, brush, snapToGrid }) {
  const [elements, setElements] = useState([]);
  const [viewport, setViewport] = useState(defaultViewport);
  const [selectedIds, setSelectedIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const draftRef = useRef(null);
  const panRef = useRef(null);
  const lastEmitRef = useRef(0);

  const visibleElements = useMemo(() => elements.filter((element) => !element.deleted), [elements]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(boardKey(roomId)) || '[]');
      if (saved.length) setElements(saved);
    } catch {
      setElements([]);
    }
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(boardKey(roomId), JSON.stringify(elements));
  }, [elements, roomId]);

  useEffect(() => {
    socketApi.setHandlers({
      onRoomState(state) {
        setElements((current) => mergeElements(current, state.elements || []));
      },
      onRemoteElement(element) {
        setElements((current) => mergeElements(current, [element]));
      },
      onRemoteErase(payload) {
        setElements((current) => mergeElements(current, payload.elements || []));
      },
      onRemoteClear(payload) {
        setElements((current) => mergeElements(current, payload.elements || []));
      },
      onRemoteUndo(payload) {
        setElements((current) => mergeElements(current, payload.elements || []));
      },
      onRemoteRedo(payload) {
        setElements((current) => mergeElements(current, payload.elements || []));
      }
    });
  }, [socketApi]);

  const commitElement = useCallback(
    (element, eventName = 'draw') => {
      const stamped = {
        ...element,
        version: Date.now(),
        updatedAt: Date.now()
      };
      setElements((current) => mergeElements(current, [stamped]));
      setHistory((items) => [...items, stamped.id].slice(-80));
      setFuture([]);
      socketApi.emit(eventName, { roomId, element: stamped });
    },
    [roomId, socketApi]
  );

  const emitDraft = useCallback(
    (element) => {
      const now = performance.now();
      if (now - lastEmitRef.current < 36) return;
      lastEmitRef.current = now;
      socketApi.emit('draw', { roomId, element: { ...element, version: Date.now() } });
    },
    [roomId, socketApi]
  );

  const normalizePoint = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top }, viewport);
      if (!snapToGrid) return point;
      return {
        x: Math.round(point.x / 16) * 16,
        y: Math.round(point.y / 16) * 16
      };
    },
    [snapToGrid, viewport]
  );

  const pointerDown = useCallback(
    (event) => {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const point = normalizePoint(event);

      if (tool === 'pan') {
        panRef.current = { x: event.clientX, y: event.clientY, viewport };
        return;
      }

      if (tool === 'text' || tool === 'sticky') {
        const text = window.prompt(tool === 'sticky' ? 'Sticky note text' : 'Text');
        if (!text) return;
        commitElement({
          id: uuid(),
          type: tool,
          x: point.x,
          y: point.y,
          w: tool === 'sticky' ? 230 : 340,
          h: tool === 'sticky' ? 170 : 80,
          text,
          fill: tool === 'sticky' ? '#fef08a' : 'transparent',
          color: tool === 'sticky' ? '#111827' : brush.color,
          size: brush.size,
          opacity: brush.opacity,
          userId: user.id,
          userName: user.name,
          createdAt: Date.now()
        });
        return;
      }

      if (DRAW_TOOLS.has(tool)) {
        draftRef.current = {
          id: uuid(),
          type: tool,
          points: [point],
          color: tool === 'eraser' ? '#000000' : brush.color,
          size: tool === 'brush' ? brush.size * 1.8 : tool === 'highlighter' ? brush.size * 2.2 : brush.size,
          opacity: tool === 'highlighter' ? Math.min(0.4, brush.opacity) : brush.opacity,
          userId: user.id,
          userName: user.name,
          createdAt: Date.now()
        };
        return;
      }

      if (SHAPE_TOOLS.has(tool)) {
        draftRef.current = {
          id: uuid(),
          type: tool,
          x: point.x,
          y: point.y,
          w: 0,
          h: 0,
          color: brush.color,
          size: brush.size,
          opacity: brush.opacity,
          userId: user.id,
          userName: user.name,
          createdAt: Date.now()
        };
      }
    },
    [brush, commitElement, normalizePoint, tool, user, viewport]
  );

  const pointerMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const screenPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const worldPoint = screenToWorld(screenPoint, viewport);
      socketApi.sendCursor({
        userId: user.id,
        name: user.name,
        color: user.color,
        x: worldPoint.x,
        y: worldPoint.y,
        screenX: screenPoint.x,
        screenY: screenPoint.y
      });

      if (panRef.current) {
        const dx = event.clientX - panRef.current.x;
        const dy = event.clientY - panRef.current.y;
        setViewport({ ...panRef.current.viewport, x: panRef.current.viewport.x + dx, y: panRef.current.viewport.y + dy });
        return;
      }

      if (!draftRef.current) return;
      const point = normalizePoint(event);
      const draft = draftRef.current;
      if (draft.points) {
        draft.points = [...draft.points, point];
      } else {
        draft.w = point.x - draft.x;
        draft.h = point.y - draft.y;
      }
      draft.version = Date.now();
      setElements((current) => mergeElements(current, [draft]));
      emitDraft(draft);
    },
    [emitDraft, normalizePoint, socketApi, user, viewport]
  );

  const pointerUp = useCallback(() => {
    if (panRef.current) {
      panRef.current = null;
      return;
    }
    if (!draftRef.current) return;
    commitElement(draftRef.current);
    draftRef.current = null;
  }, [commitElement]);

  const clearCanvas = useCallback(() => {
    const deleted = elements
      .filter((element) => !element.deleted)
      .map((element) => ({ ...element, deleted: true, version: Date.now(), updatedAt: Date.now() }));
    setElements((current) => mergeElements(current, deleted));
    socketApi.emit('clear-canvas', { roomId, elements: deleted });
  }, [elements, roomId, socketApi]);

  const undo = useCallback(() => {
    const id = [...history].reverse().find((item) => elements.some((element) => element.id === item && !element.deleted));
    if (!id) return;
    const element = elements.find((item) => item.id === id);
    const deleted = { ...element, deleted: true, version: Date.now(), updatedAt: Date.now() };
    setElements((current) => mergeElements(current, [deleted]));
    setHistory((items) => items.filter((item) => item !== id));
    setFuture((items) => [element, ...items].slice(0, 80));
    socketApi.emit('undo', { roomId, elements: [deleted] });
  }, [elements, history, roomId, socketApi]);

  const redo = useCallback(() => {
    const [element, ...rest] = future;
    if (!element) return;
    const restored = { ...element, deleted: false, version: Date.now(), updatedAt: Date.now() };
    setElements((current) => mergeElements(current, [restored]));
    setFuture(rest);
    setHistory((items) => [...items, restored.id].slice(-80));
    socketApi.emit('redo', { roomId, elements: [restored] });
  }, [future, roomId, socketApi]);

  const addImage = useCallback(
    (dataUrl) => {
      commitElement({
        id: uuid(),
        type: 'image',
        x: 120,
        y: 120,
        w: 420,
        h: 280,
        src: dataUrl,
        opacity: 1,
        userId: user.id,
        userName: user.name,
        createdAt: Date.now()
      });
    },
    [commitElement, user]
  );

  const zoomBy = useCallback((delta) => {
    setViewport((current) => ({
      ...current,
      zoom: Math.min(3, Math.max(0.25, Number((current.zoom + delta).toFixed(2))))
    }));
  }, []);

  const resetView = useCallback(() => setViewport(defaultViewport), []);

  return {
    elements,
    visibleElements,
    viewport,
    selectedIds,
    setSelectedIds,
    setViewport,
    pointerDown,
    pointerMove,
    pointerUp,
    clearCanvas,
    undo,
    redo,
    addImage,
    zoomBy,
    resetView,
    canUndo: history.length > 0,
    canRedo: future.length > 0
  };
}
