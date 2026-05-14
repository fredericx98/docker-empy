import { useState } from 'react'
import Header from '../../components/layout/Header'
import StatusBadge from '../../components/ui/StatusBadge'
import { EXECUTIONS, ACTION_TYPES, fmtDate, duration } from '../../data/mock'

const ALL = 'all'

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#0d1526] border border-[#151e35] text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500/40"
    >
      <option value={ALL}>{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export default function Ejecuciones() {
  const [typeFilter,   setTypeFilter]   = useState(ALL)
  const [targetFilter, setTargetFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)

  const targets = [...new Set(EXECUTIONS.map(e => e.target))]

  const filtered = EXECUTIONS.filter(e =>
    (typeFilter   === ALL || e.type   === typeFilter)   &&
    (targetFilter === ALL || e.target === targetFilter) &&
    (statusFilter === ALL || e.status === statusFilter)
  )

  return (
    <div>
      <Header title="Ejecuciones" subtitle="Historial de operaciones ejecutadas vía Step Functions" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select
          value={typeFilter} onChange={setTypeFilter}
          placeholder="Todos los tipos"
          options={ACTION_TYPES.map(a => ({ value: a.id, label: a.label }))}
        />
        <Select
          value={targetFilter} onChange={setTargetFilter}
          placeholder="Todos los targets"
          options={targets.map(t => ({ value: t, label: t.toUpperCase() }))}
        />
        <Select
          value={statusFilter} onChange={setStatusFilter}
          placeholder="Todos los estados"
          options={[
            { value: 'SUCCEEDED', label: 'OK' },
            { value: 'FAILED',    label: 'Falló' },
            { value: 'RUNNING',   label: 'Running' },
          ]}
        />
        {(typeFilter !== ALL || targetFilter !== ALL || statusFilter !== ALL) && (
          <button
            onClick={() => { setTypeFilter(ALL); setTargetFilter(ALL); setStatusFilter(ALL) }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0d1526] border border-[#151e35] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#151e35]">
              {['Operación', 'Target', 'Estado', 'Inicio', 'Duración', 'Por'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151e35]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-600 text-sm">
                  Sin resultados para los filtros seleccionados
                </td>
              </tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="hover:bg-white/[.02] transition-colors">
                <td className="px-4 py-3 text-slate-300 font-medium">
                  {ACTION_TYPES.find(a => a.id === e.type)?.label ?? e.type}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-[#080c18] border border-[#151e35] px-2 py-0.5 rounded text-slate-400 uppercase">
                    {e.target}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{fmtDate(e.startedAt)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{duration(e.startedAt, e.finishedAt)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[160px]">{e.triggeredBy}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t border-[#151e35] text-xs text-slate-600">
          {filtered.length} de {EXECUTIONS.length} ejecuciones
        </div>
      </div>
    </div>
  )
}
