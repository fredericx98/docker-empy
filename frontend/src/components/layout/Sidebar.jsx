import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wrench, ClipboardList, Server } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  {
    group: 'BPlayBet',
    items: [
      { to: '/bplaybet/overview',     icon: LayoutDashboard, label: 'Overview'      },
      { to: '/bplaybet/operaciones',  icon: Wrench,          label: 'Operaciones'   },
      { to: '/bplaybet/ejecuciones',  icon: ClipboardList,   label: 'Ejecuciones'   },
    ],
  },
  {
    group: 'Hosting',
    items: [
      { to: '/plesk', icon: Server, label: 'Plesk' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#080c18] border-r border-[#151e35] h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#151e35]">
        <span className="text-xl font-bold tracking-tight text-white">BPlay<span className="text-orange-500">Bet</span></span>
        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">Infra Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-2 mb-1">{group}</p>
            <ul className="space-y-0.5">
              {items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      )
                    }
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#151e35]">
        <p className="text-[10px] text-slate-600">Producción · us-east-1</p>
      </div>
    </aside>
  )
}
