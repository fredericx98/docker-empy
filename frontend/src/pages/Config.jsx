import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ToggleLeft, ToggleRight, Lock, Edit3 } from 'lucide-react'
import SectionHeader from '../components/ui/SectionHeader.jsx'
import { CONFIG } from '../api/mockData.js'

function useMock(key, data) {
  return useQuery({ queryKey: [key], queryFn: () => new Promise(r => setTimeout(() => r(data), 200)) })
}

function FeatureFlag({ flag, onToggle }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-200">{flag.label}</p>
        <p className="text-[10px] font-mono text-gray-600 mt-0.5">{flag.key}</p>
      </div>
      <button
        onClick={() => onToggle(flag.key)}
        className="flex items-center gap-2 group"
      >
        <span className={`text-xs font-medium ${flag.enabled ? 'text-emerald-400' : 'text-gray-600'}`}>
          {flag.enabled ? 'ON' : 'OFF'}
        </span>
        {flag.enabled
          ? <ToggleRight className="w-7 h-7 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          : <ToggleLeft  className="w-7 h-7 text-gray-600 group-hover:text-gray-400 transition-colors" />
        }
      </button>
    </div>
  )
}

export default function Config() {
  const { data: config } = useMock('config', CONFIG)
  const [flags, setFlags] = useState(null)

  const currentFlags = flags ?? config?.featureFlags ?? []

  const toggleFlag = (key) => {
    setFlags(prev => {
      const base = prev ?? config?.featureFlags ?? []
      return base.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f)
    })
  }

  if (!config) return <div className="text-gray-500 text-sm">Cargando...</div>

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Environment info banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-500/5 border border-brand-500/15">
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
        <div className="text-sm text-brand-300 font-medium">Entorno: <span className="text-white">Production · bplaybet · us-east-1</span></div>
        <div className="ml-auto text-xs text-gray-500">Los cambios requieren permisos de administrador</div>
      </div>

      {/* Feature Flags */}
      <div className="card p-5">
        <SectionHeader title="Feature Flags" sub="Activación/desactivación de funcionalidades en tiempo real" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {currentFlags.map(flag => (
            <FeatureFlag key={flag.key} flag={flag} onToggle={toggleFlag} />
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4 flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          En producción, los cambios se sincronizan vía API Gateway → Lambda → Parameter Store
        </p>
      </div>

      {/* System Parameters */}
      <div className="card p-5">
        <SectionHeader title="Parámetros del Sistema" sub="AWS Parameter Store / Secrets Manager" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-3 pr-4 font-medium">Parámetro</th>
                <th className="text-left py-3 pr-4 font-medium">Valor actual</th>
                <th className="text-right py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {config.params.map(p => (
                <tr key={p.key} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-300">{p.key}</td>
                  <td className="py-3 pr-4 text-sm text-gray-200 tabular-nums">{p.value}</td>
                  <td className="py-3 text-right">
                    {p.editable ? (
                      <button className="flex items-center gap-1.5 ml-auto px-2.5 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition-colors">
                        <Edit3 className="w-3 h-3" /> Editar
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 ml-auto text-xs text-gray-600">
                        <Lock className="w-3 h-3" /> Solo lectura
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
