import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { GitBranch, Play, Clock } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import KPICard from '../components/ui/KPICard.jsx'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { STEP_FNS } from '../api/mockData.js'

function useMock(key, data) {
  return useQuery({ queryKey: [key], queryFn: () => new Promise(r => setTimeout(() => r(data), 300)) })
}

export default function StepFunctions() {
  const { data: workflows = [] } = useMock('stepFns', STEP_FNS)

  const allExec  = workflows.flatMap(w => w.executions)
  const running  = allExec.filter(e => e.status === 'running').length
  const failed   = allExec.filter(e => e.status === 'failed').length
  const success  = allExec.filter(e => e.status === 'succeeded').length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard title="En ejecución"  value={running} icon={Play}       variant="info"    sub="Workflows activos" />
        <KPICard title="Completadas"   value={success} icon={GitBranch}  variant="success" sub="Últimas 24h" />
        <KPICard title="Fallidas"      value={failed}  icon={Clock}      variant={failed > 0 ? 'danger' : 'success'} sub="Últimas 24h" />
      </div>

      {/* Workflow cards */}
      <div className="space-y-4">
        {workflows.map(wf => (
          <div key={wf.name} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-white">{wf.name}</h3>
                </div>
                <p className="text-[10px] text-gray-600 font-mono mt-1">{wf.arn}</p>
              </div>
              <div className="flex items-center gap-2">
                {wf.executions.some(e => e.status === 'running') && (
                  <StatusBadge status="running" label="En ejecución" />
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left py-2 pr-4 font-medium">ID Ejecución</th>
                    <th className="text-left py-2 pr-4 font-medium">Estado</th>
                    <th className="text-left py-2 pr-4 font-medium">Inicio</th>
                    <th className="text-left py-2 font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {wf.executions.map(ex => (
                    <tr key={ex.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{ex.id}</td>
                      <td className="py-2.5 pr-4"><StatusBadge status={ex.status} /></td>
                      <td className="py-2.5 pr-4 text-xs text-gray-400">
                        {format(ex.startTime, 'dd/MM HH:mm')}{' '}
                        <span className="text-gray-600">({formatDistanceToNow(ex.startTime, { addSuffix: true, locale: es })})</span>
                      </td>
                      <td className="py-2.5 text-xs">
                        <span className={ex.status === 'running' ? 'text-blue-400 animate-pulse' : 'text-gray-400'}>
                          {ex.duration}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
