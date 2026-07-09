import { useCallback, useState } from 'react';

export const useCanvas = () => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => setZoom((value) => Math.min(8, Number((value + 0.25).toFixed(2)))), []);
  const zoomOut = useCallback(() => setZoom((value) => Math.max(0.5, Number((value - 0.25).toFixed(2)))), []);
  const fit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    zoomIn,
    zoomOut,
    fit,
    reset,
  };
};
