import {
  Activity, Users, Zap, TrendingUp, ShieldCheck, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import KPICard from '../components/ui/KPICard.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { SERVICES, ALERTS, ANALYTICS } from '../api/mockData.js'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 }

function useMock(key, data, delay = 400) {
  return useQuery({
    queryKey: [key],
    queryFn: () => new Promise(r => setTimeout(() => r(data), delay)),
  })
}

export default function Overview() {
  const { data: services = [] } = useMock('services', SERVICES)
  const { data: alerts = [] }   = useMock('alerts',   ALERTS)
  const { data: analytics }     = useMock('analytics', ANALYTICS)

  const healthy  = services.filter(s => s.status === 'healthy').length
  const degraded = services.filter(s => s.status === 'warning').length
  const openAlerts = alerts.filter(a => !a.ack).length

  const sortedAlerts = [...alerts]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 5)

  const SEVERITY_BADGE = { critical: 'critical', warning: 'warning', info: 'info' }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Servicios OK"
          value={`${healthy}/${services.length}`}
          sub={degraded > 0 ? `${degraded} con warning` : 'Todos operativos'}
          icon={ShieldCheck}
          variant={degraded > 0 ? 'warning' : 'success'}
          trend="0%" trendUp
        />
        <KPICard
          title="Latencia P99"
          value="274 ms"
          sub="Odds Engine (peak)"
          icon={Activity}
          variant={degraded > 0 ? 'warning' : 'success'}
          trend="+18 ms" trendUp={false}
        />
        <KPICard
          title="Usuarios Activos"
          value="5,842"
          sub="En este momento"
          icon={Users}
          variant="brand"
          trend="+12%" trendUp
        />
        <KPICard
          title="Apuestas / hora"
          value="1,248"
          sub="Promedio última hora"
          icon={Zap}
          variant="info"
          trend="+6%" trendUp
        />
        <KPICard
          title="Revenue hoy"
          value="$1.82M"
          sub="GGR acumulado"
          icon={TrendingUp}
          variant="success"
          trend="+9%" trendUp
        />
        <KPICard
          title="Alertas abiertas"
          value={openAlerts}
          sub={openAlerts > 0 ? 'Requieren atención' : 'Todo OK'}
          icon={AlertTriangle}
          variant={openAlerts > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Charts row */}
      {analytics && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-5">
            <SectionHeader title="Apuestas por hora" sub="Últimas 24 horas" />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.betsPerHour}>
                <defs>
                  <linearGradient id="betsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#betsGrad)" name="Apuestas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <SectionHeader title="Latencia API (ms)" sub="P50 / P95 / P99 — 24h" />
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.apiLatency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={1.5} dot={false} name="P50" />
                <Line type="monotone" dataKey="p95" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="P95" />
                <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1.5} dot={false} name="P99" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Services + Alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Service status */}
        <div className="card p-5">
          <SectionHeader title="Estado de Servicios" sub={`${services.length} servicios monitoreados`} />
          <div className="space-y-2">
            {services.map(svc => (
              <div key={svc.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusBadge status={svc.status} />
                  <span className="text-sm text-gray-200">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="tabular-nums">{svc.latency} ms</span>
                  <span className="text-gray-600">{svc.uptime}% up</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card p-5">
          <SectionHeader
            title="Alertas Recientes"
            sub={`${openAlerts} sin reconocer`}
          />
          <div className="space-y-3">
            {sortedAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="mt-0.5">
                  <StatusBadge status={SEVERITY_BADGE[alert.severity]} label={alert.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.msg}</p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {formatDistanceToNow(alert.time, { addSuffix: true, locale: es })}
                    {alert.ack && <span className="ml-2 text-emerald-600">✓ reconocida</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
