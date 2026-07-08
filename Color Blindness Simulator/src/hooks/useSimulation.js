import { useEffect, useMemo, useState } from 'react';
import { processImage } from '../utils/imageProcessor';

export const useSimulation = ({ image, mode, intensity }) => {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!image?.src) {
      setResult(null);
      setError('');
      return undefined;
    }

    setIsProcessing(true);
    setError('');

    processImage({ src: image.src, mode, intensity })
      .then((nextResult) => {
        if (!cancelled) {
          setResult(nextResult);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('The image could not be processed. Try a smaller file or another format.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [image, mode, intensity]);

  return useMemo(
    () => ({
      simulatedSrc: result?.src || image?.src || '',
      histograms: result?.histograms || null,
      processedSize: result ? { width: result.width, height: result.height } : null,
      isProcessing,
      error,
    }),
    [error, image?.src, isProcessing, result],
  );
};
