import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCheck, Filter } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import KPICard from '../components/ui/KPICard.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { ALERTS } from '../api/mockData.js'
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react'

const SEV_BADGE = { critical: 'critical', warning: 'warning', info: 'info' }
const SEV_ORDER = { critical: 0, warning: 1, info: 2 }

function useMockAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => new Promise(r => setTimeout(() => r(ALERTS), 300)),
  })
}

export default function Alerts() {
  const { data: alerts = [] } = useMockAlerts()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const ackMutation = useMutation({
    mutationFn: async (id) => new Promise(r => setTimeout(() => r(id), 200)),
    onSuccess: () => qc.invalidateQueries(['alerts']),
  })

  const critical = alerts.filter(a => a.severity === 'critical').length
  const warning  = alerts.filter(a => a.severity === 'warning').length
  const open     = alerts.filter(a => !a.ack).length

  const filtered = [...alerts]
    .filter(a => filter === 'all' ? true : filter === 'open' ? !a.ack : a.severity === filter)
    .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])

  const FILTERS = [
    { id: 'all',      label: 'Todas' },
    { id: 'open',     label: 'Sin ack' },
    { id: 'critical', label: 'Critical' },
    { id: 'warning',  label: 'Warning' },
    { id: 'info',     label: 'Info' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard title="Critical"       value={critical} icon={AlertTriangle} variant={critical > 0 ? 'danger' : 'success'} />
        <KPICard title="Warning"        value={warning}  icon={AlertTriangle} variant={warning  > 0 ? 'warning' : 'success'} />
        <KPICard title="Sin reconocer"  value={open}     icon={ShieldCheck}   variant={open > 0 ? 'danger' : 'success'} />
      </div>

      {/* Alert list */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Registro de Alertas" sub={`${alerts.length} alertas en total`} />
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                alert.ack
                  ? 'bg-gray-800/30 border-gray-800/50'
                  : alert.severity === 'critical'
                  ? 'bg-red-500/5 border-red-500/15'
                  : alert.severity === 'warning'
                  ? 'bg-amber-500/5 border-amber-500/15'
                  : 'bg-blue-500/5 border-blue-500/15'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <StatusBadge status={SEV_BADGE[alert.severity]} label={alert.severity.toUpperCase()} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold leading-tight ${alert.ack ? 'text-gray-500' : 'text-gray-100'}`}>
                    {alert.title}
                  </p>
                  <span className="text-[10px] text-gray-600 shrink-0 tabular-nums">
                    {format(alert.time, 'dd/MM HH:mm')}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${alert.ack ? 'text-gray-600' : 'text-gray-400'}`}>{alert.msg}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-600 font-mono bg-gray-800 px-1.5 py-0.5 rounded">{alert.service}</span>
                  <span className="text-[10px] text-gray-600">
                    {formatDistanceToNow(alert.time, { addSuffix: true, locale: es })}
                  </span>
                  {alert.ack && <span className="text-[10px] text-emerald-600">✓ reconocida</span>}
                </div>
              </div>
              {!alert.ack && (
                <button
                  onClick={() => ackMutation.mutate(alert.id)}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Ack
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
