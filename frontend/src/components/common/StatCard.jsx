import React, { useEffect, useRef, useState } from 'react';

const TONE_MAP = {
  'bg-blue-500': { border: 'border-t-accent', icon: 'text-accent' },
  'bg-green-500': { border: 'border-t-success', icon: 'text-success' },
  'bg-red-500': { border: 'border-t-danger', icon: 'text-danger' },
  'bg-purple-500': { border: 'border-t-accent', icon: 'text-accent' },
  'bg-yellow-500': { border: 'border-t-warning', icon: 'text-warning' },
  'bg-amber-500': { border: 'border-t-warning', icon: 'text-warning' },
};

const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);
  const firstRun = useRef(true);
  useEffect(() => {
    if (typeof target !== 'number') { setValue(target); return; }
    const start = performance.now();
    const from = firstRun.current ? 0 : value;
    firstRun.current = false;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
};

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => {
  const tone = TONE_MAP[colorClass] || TONE_MAP['bg-blue-500'];
  const isNumeric = typeof value === 'number';
  const displayValue = useCountUp(isNumeric ? value : 0);
  return (
    <div className={`bg-surface-card rounded-card shadow-card border border-border border-t-[3px] ${tone.border} p-6`}>
      <div className="flex items-center gap-2 text-ink-300">
        {Icon && <Icon className="h-4 w-4" />}
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="mt-2 font-mono text-[32px] font-semibold leading-none text-ink-900 tabular-nums">
        {isNumeric ? displayValue : value}
      </p>
      {subtitle && <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
