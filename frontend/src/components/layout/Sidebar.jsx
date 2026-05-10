import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Activity, Server, BarChart3,
  BellRing, GitBranch, Settings, Zap,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Overview'        },
  { to: '/monitoring',     icon: Activity,        label: 'Monitoreo'       },
  { to: '/infrastructure', icon: Server,          label: 'Infraestructura' },
  { to: '/analytics',      icon: BarChart3,       label: 'Analytics'       },
  { to: '/alerts',         icon: BellRing,        label: 'Alertas',  badge: 3 },
  { to: '/step-functions', icon: GitBranch,       label: 'Step Functions'  },
  { to: '/config',         icon: Settings,        label: 'Configuración'   },
]

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-60 min-h-screen bg-gray-950 border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 shadow-lg shadow-brand-500/30">
          <Zap className="w-5 h-5 text-gray-950" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide leading-none">BPlayBet</p>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">Monitor</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60',
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer env indicator */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800">
          <span className="dot-pulse bg-emerald-400" />
          <span className="text-xs text-gray-400">Production · us-east-1</span>
        </div>
      </div>
    </aside>
  )
}
