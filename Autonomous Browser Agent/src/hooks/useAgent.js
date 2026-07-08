import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const initialTask = {
  id: null,
  command: '',
  status: 'idle',
  progress: 0,
  currentUrl: 'about:blank',
  currentAction: 'Waiting for a command',
  plan: [],
  logs: [],
  result: null,
  screenshot: null,
  startedAt: null,
  finishedAt: null
};

function wsUrl() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

export function useAgent() {
  const [activeTask, setActiveTask] = useState(initialTask);
  const [history, setHistory] = useState([]);
  const [connection, setConnection] = useState('connecting');
  const activeIdRef = useRef(null);

  const refreshHistory = useCallback(async () => {
    const { data } = await axios.get('/api/agent/history');
    setHistory(data.tasks || []);
  }, []);

  useEffect(() => {
    refreshHistory().catch(() => setHistory([]));
  }, [refreshHistory]);

  useEffect(() => {
    const socket = new WebSocket(wsUrl());

    socket.addEventListener('open', () => setConnection('connected'));
    socket.addEventListener('close', () => setConnection('offline'));
    socket.addEventListener('error', () => setConnection('offline'));
    socket.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data);
      if (!payload.taskId || payload.taskId !== activeIdRef.current) return;

      setActiveTask((task) => ({
        ...task,
        ...payload.task,
        logs: payload.task?.logs || task.logs,
        plan: payload.task?.plan || task.plan,
        result: payload.task?.result ?? task.result,
        screenshot: payload.task?.screenshot ?? task.screenshot
      }));

      if (['completed', 'failed', 'needs_user'].includes(payload.task?.status)) {
        refreshHistory().catch(() => {});
      }
    });

    return () => socket.close();
  }, [refreshHistory]);

  const startTask = useCallback(async (command, options = {}) => {
    const cleanCommand = command.trim();
    if (!cleanCommand) return null;

    const optimistic = {
      ...initialTask,
      command: cleanCommand,
      status: 'queued',
      currentAction: 'Creating browser plan',
      startedAt: new Date().toISOString()
    };
    setActiveTask(optimistic);

    const { data } = await axios.post('/api/agent/run', { command: cleanCommand, options });
    activeIdRef.current = data.task.id;
    setActiveTask(data.task);
    refreshHistory().catch(() => {});
    return data.task;
  }, [refreshHistory]);

  const loadTask = useCallback(async (taskId) => {
    const { data } = await axios.get(`/api/agent/tasks/${taskId}`);
    activeIdRef.current = data.task.id;
    setActiveTask(data.task);
  }, []);

  const stopTask = useCallback(async () => {
    if (!activeIdRef.current) return;
    const { data } = await axios.post(`/api/agent/tasks/${activeIdRef.current}/stop`);
    setActiveTask(data.task);
    refreshHistory().catch(() => {});
  }, [refreshHistory]);

  const replayTask = useCallback(async (taskId) => {
    const { data } = await axios.post(`/api/agent/tasks/${taskId}/replay`);
    activeIdRef.current = data.task.id;
    setActiveTask(data.task);
    refreshHistory().catch(() => {});
  }, [refreshHistory]);

  return useMemo(() => ({
    activeTask,
    history,
    connection,
    startTask,
    stopTask,
    loadTask,
    replayTask,
    refreshHistory
  }), [activeTask, history, connection, startTask, stopTask, loadTask, replayTask, refreshHistory]);
}
