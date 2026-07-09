import { intervalToDuration } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { toDate } from '../utils/helpers.js';

function calculate(target) {
  const end = toDate(target);
  const now = new Date();
  const total = Math.max(0, end.getTime() - now.getTime());
  const duration = intervalToDuration({ start: now, end: total === 0 ? now : end });
  return {
    total,
    years: duration.years || 0,
    months: duration.months || 0,
    days: duration.days || 0,
    hours: duration.hours || 0,
    minutes: duration.minutes || 0,
    seconds: duration.seconds || 0,
    unlocked: total === 0,
  };
}

export function useCountdown(target) {
  const [value, setValue] = useState(() => calculate(target));

  useEffect(() => {
    setValue(calculate(target));
    const timer = window.setInterval(() => setValue(calculate(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return useMemo(() => value, [value]);
}
