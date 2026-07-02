import React from 'react';

const STATUS_CONFIG = {
  APPROVED:      { bg: 'bg-success-soft',    text: 'text-success', dot: 'bg-success' },
  REJECTED:      { bg: 'bg-danger-soft',     text: 'text-danger',  dot: 'bg-danger' },
  PENDING:       { bg: 'bg-ink-300/10',      text: 'text-ink-500', dot: 'bg-ink-300' },
  UNDER_REVIEW:  { bg: 'bg-info-soft',       text: 'text-info',    dot: 'bg-info' },
  MANUAL_REVIEW: { bg: 'bg-warning-soft',    text: 'text-warning', dot: 'bg-warning' },
  ACTIVE:        { bg: 'bg-success-soft',    text: 'text-success', dot: 'bg-success' },
  CLOSED:        { bg: 'bg-ink-300/10',      text: 'text-ink-500', dot: 'bg-ink-300' },
  DEFAULTED:     { bg: 'bg-danger-soft',     text: 'text-danger',  dot: 'bg-danger' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const label = status ? status.replace(/_/g, ' ') : '';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
