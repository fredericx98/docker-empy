import clsx from 'clsx'

export default function KPICard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-[#0d1526] border border-[#151e35] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        {Icon && <Icon size={16} className={clsx('opacity-60', accent ?? 'text-slate-400')} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
