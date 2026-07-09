import { useCallback, useMemo, useState } from 'react';
import { defaultCard, requiredFields } from '../data/defaultCard';

export function useCardState() {
  const [card, setCard] = useState(defaultCard);
  const [accentColor, setAccentColor] = useState('#22C55E');
  const [template, setTemplate] = useState('modern');
  const [touchedDownloads, setTouchedDownloads] = useState(false);

  const updateCard = useCallback((field, value) => {
    setCard((current) => ({ ...current, [field]: value }));
  }, []);

  const missingFields = useMemo(
    () => requiredFields.filter((field) => !card[field]?.trim()),
    [card],
  );

  const canDownload = missingFields.length === 0;

  return {
    accentColor,
    canDownload,
    card,
    missingFields,
    setAccentColor,
    setTemplate,
    setTouchedDownloads,
    template,
    touchedDownloads,
    updateCard,
  };
}
