import clsx from 'clsx'

const MAP = {
  healthy:  { cls: 'badge-healthy', dot: 'bg-emerald-400', label: 'Healthy'   },
  warning:  { cls: 'badge-warning', dot: 'bg-amber-400',   label: 'Warning'   },
  critical: { cls: 'badge-critical', dot: 'bg-red-400',    label: 'Critical'  },
  stopped:  { cls: 'badge-critical', dot: 'bg-red-600',    label: 'Stopped'   },
  info:     { cls: 'badge-info',    dot: 'bg-blue-400',    label: 'Info'      },
  running:  { cls: 'badge-healthy', dot: 'bg-emerald-400', label: 'Running'   },
  pending:  { cls: 'badge-info',    dot: 'bg-blue-400',    label: 'Pending'   },
  failed:   { cls: 'badge-critical', dot: 'bg-red-400',    label: 'Failed'    },
  succeeded:{ cls: 'badge-healthy', dot: 'bg-emerald-400', label: 'Succeeded' },
}

export default function StatusBadge({ status, label }) {
  const cfg = MAP[status] ?? MAP.info
  return (
    <span className={cfg.cls}>
      <span className={clsx('dot-pulse w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {label ?? cfg.label}
    </span>
  )
}
