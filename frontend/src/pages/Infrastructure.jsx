import { useQuery } from '@tanstack/react-query'
import { Server, Database, Layers, Zap, HardDrive } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { INFRA } from '../api/mockData.js'

function useMock(key, data) {
  return useQuery({ queryKey: [key], queryFn: () => new Promise(r => setTimeout(() => r(data), 300)) })
}

function ProgressBar({ value, warn = 70, danger = 90 }) {
  const color = value >= danger ? 'bg-red-500' : value >= warn ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs tabular-nums ${value >= danger ? 'text-red-400' : value >= warn ? 'text-amber-400' : 'text-gray-400'}`}>
        {value}%
      </span>
    </div>
  )
}

export default function Infrastructure() {
  const { data: infra } = useMock('infra', INFRA)
  if (!infra) return <div className="text-gray-500 text-sm">Cargando...</div>

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ECS Clusters */}
      <div className="card p-5">
        <SectionHeader
          title="ECS Clusters"
          sub={`${infra.ecs.reduce((a, c) => a + c.services, 0)} servicios total`}
          action={<Server className="w-4 h-4 text-gray-600" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {infra.ecs.map(c => (
            <div key={c.name} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-gray-200 leading-tight">{c.name}</p>
                <StatusBadge status={c.running === c.services ? 'healthy' : 'warning'} label={`${c.running}/${c.services}`} />
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-xs text-gray-500 mb-1">CPU</p>
                  <ProgressBar value={c.cpu} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Memoria</p>
                  <ProgressBar value={c.memory} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RDS */}
      <div className="card p-5">
        <SectionHeader title="RDS / Aurora" sub="Bases de datos relacionales" action={<Database className="w-4 h-4 text-gray-600" />} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-3 pr-4 font-medium">Identificador</th>
                <th className="text-left py-3 pr-4 font-medium">Motor</th>
                <th className="text-left py-3 pr-4 font-medium">Rol</th>
                <th className="text-left py-3 pr-4 font-medium">Estado</th>
                <th className="text-left py-3 pr-4 font-medium">Storage</th>
                <th className="text-left py-3 font-medium">AZ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {infra.rds.map(db => (
                <tr key={db.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-300">{db.id}</td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{db.engine}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${db.role === 'Primary' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-700 text-gray-400'}`}>
                      {db.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4"><StatusBadge status="healthy" label={db.status} /></td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{db.storage}</td>
                  <td className="py-3 text-gray-400 text-xs font-mono">{db.az}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ElastiCache */}
      <div className="card p-5">
        <SectionHeader title="ElastiCache" sub="Redis clusters" action={<Layers className="w-4 h-4 text-gray-600" />} />
        {infra.elasticache.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
            <div>
              <p className="text-sm font-medium text-gray-200">{c.id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.engine} · {c.nodes} nodos · {c.memory}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-mono">{c.az}</span>
              <StatusBadge status="healthy" label={c.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Lambda functions */}
      <div className="card p-5">
        <SectionHeader title="Lambda Functions" sub={`${infra.lambdas.length} funciones`} action={<Zap className="w-4 h-4 text-gray-600" />} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-3 pr-4 font-medium">Función</th>
                <th className="text-left py-3 pr-4 font-medium">Runtime</th>
                <th className="text-right py-3 pr-4 font-medium">Memoria</th>
                <th className="text-right py-3 pr-4 font-medium">Invocaciones 24h</th>
                <th className="text-right py-3 pr-4 font-medium">Errores</th>
                <th className="text-right py-3 font-medium">P99 (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {infra.lambdas.map(fn => (
                <tr key={fn.name} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-300">{fn.name}</td>
                  <td className="py-3 pr-4 text-xs text-gray-500">{fn.runtime}</td>
                  <td className="py-3 pr-4 text-right text-xs text-gray-400">{fn.memory}</td>
                  <td className="py-3 pr-4 text-right tabular-nums text-gray-300">{fn.invocations.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    <span className={fn.errors > 0 ? 'text-red-400' : 'text-emerald-400'}>{fn.errors}</span>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    <span className={fn.p99 > 1000 ? 'text-amber-400' : 'text-gray-300'}>{fn.p99} ms</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* S3 Buckets */}
      <div className="card p-5">
        <SectionHeader title="S3 Buckets" sub={`${infra.s3.length} buckets`} action={<HardDrive className="w-4 h-4 text-gray-600" />} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {infra.s3.map(b => (
            <div key={b.name} className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <div>
                <p className="text-sm font-mono text-gray-200">{b.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.objects} objetos · {b.size}</p>
              </div>
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">{b.access}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
