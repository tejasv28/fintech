import React, { useEffect, useState } from 'react';

const RiskGauge = ({ score = 0, size = 280 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const normalizedTarget = Math.max(0, Math.min(100, score));

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(eased * normalizedTarget);
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [normalizedTarget]);

  const radius = (size - 24) / 2;
  const center = size / 2;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  let zoneColor = 'var(--color-success)';
  let zoneSoftBg = 'bg-success-soft';
  let zoneTextColor = 'text-success';
  let zoneLabel = 'Low Risk';
  if (normalizedTarget > 33 && normalizedTarget <= 66) {
    zoneColor = 'var(--color-warning)'; zoneSoftBg = 'bg-warning-soft'; zoneTextColor = 'text-warning'; zoneLabel = 'Medium Risk';
  } else if (normalizedTarget > 66) {
    zoneColor = 'var(--color-danger)'; zoneSoftBg = 'bg-danger-soft'; zoneTextColor = 'text-danger'; zoneLabel = 'High Risk';
  }

  const tickAngles = [0, 50, 100].map((v) => (v / 100) * 360 - 90);
  const tickRadius = radius + 16;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="riskGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00B37E" />
              <stop offset="50%" stopColor="#FF9F1C" />
              <stop offset="100%" stopColor="#F0426B" />
            </linearGradient>
          </defs>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="url(#riskGaugeGradient)" strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 80ms linear' }} />
        </svg>
        {tickAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = center + tickRadius * Math.cos(rad);
          const y = center + tickRadius * Math.sin(rad);
          return (
            <span key={i} className="absolute font-mono text-[10px] text-ink-300"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
              {[0, 50, 100][i]}
            </span>
          );
        })}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-5xl font-semibold tabular-nums" style={{ color: zoneColor }}>
            {animatedScore.toFixed(1)}
          </span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-300">Risk Score</span>
          <span className={`mt-3 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${zoneSoftBg} ${zoneTextColor}`}>
            {zoneLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
