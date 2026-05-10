import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import KPICard from '../components/ui/KPICard.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { ANALYTICS } from '../api/mockData.js'
import { TrendingUp, Wallet, Users, Target } from 'lucide-react'

function useMock(key, data) {
  return useQuery({ queryKey: [key], queryFn: () => new Promise(r => setTimeout(() => r(data), 300)) })
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }
}

export default function Analytics() {
  const { data: analytics } = useMock('analytics', ANALYTICS)
  if (!analytics) return <div className="text-gray-500 text-sm">Cargando...</div>

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="GGR hoy"          value="$1.82M"  sub="Gross Gaming Revenue"    icon={TrendingUp} variant="success" trend="+9%" trendUp />
        <KPICard title="Handle total"     value="$14.3M"  sub="Apuestas aceptadas"      icon={Wallet}     variant="brand"   trend="+6%" trendUp />
        <KPICard title="Usuarios únicos"  value="18,420"  sub="Activos en 24h"          icon={Users}      variant="info"    trend="+12%" trendUp />
        <KPICard title="Ticket promedio"  value="$11.48"  sub="Por apuesta"             icon={Target}     variant="default" trend="-2%" trendUp={false} />
      </div>

      {/* Revenue + Bets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader title="Revenue (GGR)" sub="Últimas 24 horas · USD" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v.toLocaleString()}`, 'GGR']} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" name="GGR" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <SectionHeader title="Apuestas por hora" sub="Últimas 24 horas" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.betsPerHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [v.toLocaleString(), 'Apuestas']} />
              <Bar dataKey="value" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Apuestas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active users */}
      <div className="card p-5">
        <SectionHeader title="Usuarios activos" sub="Últimas 24 horas" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analytics.activeUsers}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [v.toLocaleString(), 'Usuarios']} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="Usuarios activos" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top events */}
      <div className="card p-5">
        <SectionHeader title="Top Eventos" sub="Más apostados hoy" />
        <div className="space-y-0 divide-y divide-gray-800">
          {analytics.topEvents.map((evt, i) => (
            <div key={evt.event} className="flex items-center gap-4 py-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-400 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{evt.event}</p>
                <p className="text-xs text-gray-500 mt-0.5">{evt.bets.toLocaleString()} apuestas</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-400">{evt.volume}</p>
                <p className="text-xs text-gray-600">handle</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
