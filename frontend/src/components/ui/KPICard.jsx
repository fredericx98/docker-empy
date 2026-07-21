import clsx from 'clsx'

const VARIANTS = {
  default: 'text-white',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger:  'text-red-400',
  info:    'text-blue-400',
  brand:   'text-brand-400',
}

export default function KPICard({ title, value, sub, icon: Icon, variant = 'default', trend, trendUp }) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={clsx('p-2 rounded-lg bg-gray-800', VARIANTS[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className={clsx('text-2xl font-bold tracking-tight', VARIANTS[variant])}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={trendUp ? 'text-emerald-400' : 'text-red-400'}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
          <span className="text-gray-600">vs. última hora</span>
        </div>
      )}
    </div>
  )
}
