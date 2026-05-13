import { Server } from 'lucide-react'
import Header from '../../components/layout/Header'

export default function Plesk() {
  return (
    <div>
      <Header title="Plesk" subtitle="Panel de hosting" />
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-600 bg-[#0d1526] border border-[#151e35] rounded-xl">
        <Server size={36} strokeWidth={1.2} />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">Próximamente</p>
          <p className="text-xs mt-1">Estado de sitios, últimos backups y más</p>
        </div>
      </div>
    </div>
  )
}
