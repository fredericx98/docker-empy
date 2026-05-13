import StatusBadge from './StatusBadge'
import { fmtDate, timeAgo } from '../../data/mock'
import { Globe, RefreshCw } from 'lucide-react'

export default function FrontCard({ front }) {
  const { id, name, status, version, lastDeployedAt, lastInvalidationAt } = front
  return (
    <div className="bg-[#0d1526] border border-[#151e35] rounded-xl p-5 flex flex-col gap-4 hover:border-[#1e2d4a] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{id}</p>
          <p className="text-sm font-semibold text-white mt-0.5">{name}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600 font-mono">{version}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw size={11} className="text-slate-600" />
          <span>Deploy: {timeAgo(lastDeployedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe size={11} className="text-slate-600" />
          <span>CDN inv: {timeAgo(lastInvalidationAt)}</span>
        </div>
      </div>
    </div>
  )
}
