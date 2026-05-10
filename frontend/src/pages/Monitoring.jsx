import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { SERVICES, ANALYTICS } from '../api/mockData.js'

function useMock(key, data) {
  return useQuery({ queryKey: [key], queryFn: () => new Promise(r => setTimeout(() => r(data), 300)) })
}

export default function Monitoring() {
  const { data: services = [] } = useMock('services', SERVICES)
  const { data: analytics }     = useMock('analytics', ANALYTICS)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Latency charts */}
      {analytics && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card p-5">
            <SectionHeader title="Latencia API (ms)" sub="P50 / P95 / P99 — 24h" />
            <ResponsiveContainer width="100%" height={220}>
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

          <div className="card p-5">
            <SectionHeader title="Tasa de error (%)" sub="Últimas 24 horas" />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.errorRate}>
                <defs>
                  <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Error rate']} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#errGrad)" name="Error %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Service table */}
      <div className="card p-5">
        <SectionHeader title="Estado detallado por servicio" sub={`${services.length} servicios en monitoreo continuo`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-3 pr-4 font-medium">Servicio</th>
                <th className="text-left py-3 pr-4 font-medium">Tipo</th>
                <th className="text-left py-3 pr-4 font-medium">Estado</th>
                <th className="text-right py-3 pr-4 font-medium">Latencia</th>
                <th className="text-right py-3 pr-4 font-medium">RPS</th>
                <th className="text-right py-3 font-medium">Uptime 30d</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {services.map(svc => (
                <tr key={svc.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-200">{svc.name}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-gray-800 text-gray-400 border border-gray-700">
                      {svc.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4"><StatusBadge status={svc.status} /></td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    <span className={svc.latency > 200 ? 'text-amber-400' : 'text-gray-300'}>
                      {svc.latency} ms
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-gray-300">{svc.rps.toLocaleString()}</td>
                  <td className="py-3 text-right tabular-nums">
                    <span className={svc.uptime >= 99.9 ? 'text-emerald-400' : svc.uptime >= 99.5 ? 'text-amber-400' : 'text-red-400'}>
                      {svc.uptime}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active users */}
      {analytics && (
        <div className="card p-5">
          <SectionHeader title="Usuarios activos" sub="Últimas 24 horas" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics.activeUsers}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#usersGrad)" name="Usuarios" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
