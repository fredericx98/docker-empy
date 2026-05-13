import clsx from 'clsx'

const STYLES = {
  HEALTHY:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DEGRADED:    'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  DOWN:        'bg-red-500/10     text-red-400     border-red-500/20',
  MAINTENANCE: 'bg-purple-500/10  text-purple-400  border-purple-500/20',
  SUCCEEDED:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED:      'bg-red-500/10     text-red-400     border-red-500/20',
  RUNNING:     'bg-sky-500/10     text-sky-400     border-sky-500/20',
  IDLE:        'bg-slate-500/10   text-slate-400   border-slate-500/20',
}

const DOTS = {
  HEALTHY: 'bg-emerald-400', DEGRADED: 'bg-yellow-400', DOWN: 'bg-red-400',
  MAINTENANCE: 'bg-purple-400', SUCCEEDED: 'bg-emerald-400', FAILED: 'bg-red-400',
  RUNNING: 'bg-sky-400 animate-pulse', IDLE: 'bg-slate-500',
}

const LABELS = {
  HEALTHY: 'Healthy', DEGRADED: 'Degraded', DOWN: 'Down',
  MAINTENANCE: 'Mantenimiento', SUCCEEDED: 'OK', FAILED: 'Falló',
  RUNNING: 'Running', IDLE: 'Idle',
}

export default function StatusBadge({ status, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium', STYLES[status], className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', DOTS[status])} />
      {LABELS[status] ?? status}
    </span>
  )
}
