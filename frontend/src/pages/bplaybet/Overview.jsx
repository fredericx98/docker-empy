import { Cpu, Database, ImageIcon, Globe } from 'lucide-react'
import Header from '../../components/layout/Header'
import KPICard from '../../components/ui/KPICard'
import FrontCard from '../../components/ui/FrontCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { FRONTS, INFRA, RECENT_ACTIVITY, timeAgo } from '../../data/mock'

const ACTION_LABELS = {
  DEPLOY_COMPLETO: 'Deploy Completo',
  DEPLOY_FRONT:    'Deploy Front',
  INVALIDACION:    'Invalidación CDN',
  BUILD_AMI:       'Build AMI',
  MANTENIMIENTO:   'Mantenimiento',
}

export default function Overview() {
  const healthyCount = FRONTS.filter(f => f.status === 'HEALTHY').length

  return (
    <div>
      <Header
        title="Overview"
        subtitle="Estado general de la infraestructura BPlayBet · Producción"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={Cpu}
          label="Instancias ASG"
          value={`${INFRA.asg.running} / ${INFRA.asg.total}`}
          sub={`${INFRA.asg.healthy} saludables`}
          accent="text-sky-400"
        />
        <KPICard
          icon={Database}
          label="RDS"
          value={`${INFRA.rds.latencyMs} ms`}
          sub={`${INFRA.rds.connections} conexiones · ${INFRA.rds.storageUsedPct}% storage`}
          accent="text-emerald-400"
        />
        <KPICard
          icon={ImageIcon}
          label="Última AMI"
          value={timeAgo(INFRA.lastAmiBuild.timestamp)}
          sub={INFRA.lastAmiBuild.version.slice(0, 16) + '…'}
          accent="text-orange-400"
        />
        <KPICard
          icon={Globe}
          label="Fronts activos"
          value={`${healthyCount} / ${FRONTS.length}`}
          sub={FRONTS.filter(f => f.maintenance).length > 0 ? `${FRONTS.filter(f => f.maintenance).length} en mantenimiento` : 'Todos operativos'}
          accent="text-purple-400"
        />
      </div>

      {/* Fronts grid */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Estado por front</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {FRONTS.map(f => <FrontCard key={f.id} front={f} />)}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Actividad reciente</p>
        <div className="bg-[#0d1526] border border-[#151e35] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#151e35]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Operación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hace</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151e35]">
              {RECENT_ACTIVITY.map(e => (
                <tr key={e.id} className="hover:bg-white/[.02] transition-colors">
                  <td className="px-4 py-3 text-slate-300 font-medium">{ACTION_LABELS[e.type] ?? e.type}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-[#080c18] border border-[#151e35] px-2 py-0.5 rounded text-slate-400">{e.target}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{timeAgo(e.startedAt)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[140px]">{e.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
