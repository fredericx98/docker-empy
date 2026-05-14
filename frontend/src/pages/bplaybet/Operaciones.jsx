import { useState } from 'react'
import { Play, RefreshCw, ImageIcon, WrenchIcon, ChevronDown } from 'lucide-react'
import Header from '../../components/layout/Header'
import ConfirmModal from '../../components/ui/ConfirmModal'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import { FRONTS } from '../../data/mock'
import clsx from 'clsx'

const ALL_TARGETS = FRONTS.map(f => f.id)

function useAction() {
  const [status, setStatus] = useState('IDLE')

  const run = (ms = 4000) => {
    setStatus('RUNNING')
    setTimeout(() => setStatus('SUCCEEDED'), ms)
  }

  return { status, run, isRunning: status === 'RUNNING' }
}

function FrontSelector({ selected, onChange }) {
  const allSelected = ALL_TARGETS.every(id => selected.includes(id))

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])

  const toggleAll = () =>
    onChange(allSelected ? [] : ALL_TARGETS)

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={toggleAll}
        className={clsx(
          'px-3 py-1 rounded-md text-xs font-semibold border transition-colors',
          allSelected
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            : 'text-slate-400 border-[#1e2d4a] hover:border-slate-500'
        )}
      >
        Todos
      </button>
      {FRONTS.map(f => (
        <button
          key={f.id}
          onClick={() => toggle(f.id)}
          className={clsx(
            'px-3 py-1 rounded-md text-xs font-semibold border transition-colors font-mono uppercase',
            selected.includes(f.id)
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              : 'text-slate-400 border-[#1e2d4a] hover:border-slate-500'
          )}
        >
          {f.id}
        </button>
      ))}
    </div>
  )
}

function ActionCard({ icon: Icon, title, description, accentClass, children }) {
  return (
    <div className="bg-[#0d1526] border border-[#151e35] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center border', accentClass)}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function RunButton({ isRunning, status, onClick, disabled, label = 'Ejecutar' }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={isRunning || disabled}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
          isRunning || disabled
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        )}
      >
        {isRunning ? <Spinner size={14} className="text-slate-400" /> : <Play size={14} />}
        {isRunning ? 'Ejecutando...' : label}
      </button>
      {status !== 'IDLE' && <StatusBadge status={status} />}
    </div>
  )
}

export default function Operaciones() {
  const deployCompleto = useAction()
  const deployFront    = useAction()
  const invalidacion   = useAction()
  const buildAmi       = useAction()

  const [dcTargets,   setDcTargets]   = useState([])
  const [dfTarget,    setDfTarget]    = useState([])
  const [invTargets,  setInvTargets]  = useState([])

  const [maintTarget,  setMaintTarget]  = useState(null)
  const [maintModal,   setMaintModal]   = useState(false)
  const [maintStatus,  setMaintStatus]  = useState({})

  const openMaint = (id) => { setMaintTarget(id); setMaintModal(true) }

  const confirmMaint = () => {
    setMaintModal(false)
    setMaintStatus(s => ({ ...s, [maintTarget]: 'RUNNING' }))
    setTimeout(() => setMaintStatus(s => ({ ...s, [maintTarget]: 'SUCCEEDED' })), 2000)
  }

  return (
    <div>
      <Header title="Operaciones" subtitle="Ejecutá acciones sobre la infraestructura vía Step Functions" />

      <div className="space-y-4">

        {/* Deploy Completo */}
        <ActionCard
          icon={Play}
          title="Deploy Completo"
          description="Build AMI → Launch Template → Instance Refresh → Invalidación CDN → Notificación"
          accentClass="bg-orange-500/10 border-orange-500/20 text-orange-400"
        >
          <div>
            <p className="text-xs text-slate-500 mb-2">Seleccioná los fronts a deployar</p>
            <FrontSelector selected={dcTargets} onChange={setDcTargets} />
          </div>
          <RunButton
            isRunning={deployCompleto.isRunning}
            status={deployCompleto.status}
            onClick={() => dcTargets.length && deployCompleto.run(8000)}
            disabled={dcTargets.length === 0}
            label="Ejecutar Deploy Completo"
          />
        </ActionCard>

        {/* Deploy Front individual */}
        <ActionCard
          icon={RefreshCw}
          title="Deploy Front"
          description="Actualiza solo el front seleccionado sin reconstruir la AMI"
          accentClass="bg-sky-500/10 border-sky-500/20 text-sky-400"
        >
          <div>
            <p className="text-xs text-slate-500 mb-2">Seleccioná el front</p>
            <FrontSelector selected={dfTarget} onChange={setDfTarget} />
          </div>
          <RunButton
            isRunning={deployFront.isRunning}
            status={deployFront.status}
            onClick={() => dfTarget.length && deployFront.run(5000)}
            disabled={dfTarget.length === 0}
            label="Deployar Front"
          />
        </ActionCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Build AMI */}
          <ActionCard
            icon={ImageIcon}
            title="Build AMI"
            description="Genera una nueva imagen base. Tarda ~20 min."
            accentClass="bg-purple-500/10 border-purple-500/20 text-purple-400"
          >
            <RunButton
              isRunning={buildAmi.isRunning}
              status={buildAmi.status}
              onClick={() => buildAmi.run(20000)}
              label="Build AMI"
            />
          </ActionCard>

          {/* Invalidación */}
          <ActionCard
            icon={RefreshCw}
            title="Invalidación CDN"
            description="Limpia el caché de CloudFront"
            accentClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          >
            <FrontSelector selected={invTargets} onChange={setInvTargets} />
            <RunButton
              isRunning={invalidacion.isRunning}
              status={invalidacion.status}
              onClick={() => invTargets.length && invalidacion.run(3000)}
              disabled={invTargets.length === 0}
              label="Invalidar"
            />
          </ActionCard>

          {/* Mantenimiento */}
          <ActionCard
            icon={WrenchIcon}
            title="Mantenimiento"
            description="Activa la landing de mantenimiento en el front seleccionado"
            accentClass="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
          >
            <div className="space-y-2">
              {FRONTS.map(f => (
                <div key={f.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 uppercase">{f.id}</span>
                    <span className="text-xs text-slate-600">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {maintStatus[f.id] && <StatusBadge status={maintStatus[f.id]} />}
                    <button
                      onClick={() => openMaint(f.id)}
                      disabled={maintStatus[f.id] === 'RUNNING'}
                      className={clsx(
                        'px-2.5 py-1 rounded text-xs font-semibold border transition-colors',
                        f.maintenance
                          ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                          : 'border-[#1e2d4a] text-slate-400 hover:border-slate-500 hover:text-slate-200',
                        maintStatus[f.id] === 'RUNNING' && 'opacity-40 cursor-not-allowed'
                      )}
                    >
                      {f.maintenance ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ActionCard>

        </div>
      </div>

      {/* Confirm modal */}
      {maintModal && (
        <ConfirmModal
          title={`Mantenimiento — ${maintTarget?.toUpperCase()}`}
          description={`Vas a cambiar el modo mantenimiento del front ${maintTarget}. Esta acción afecta a los usuarios en producción.`}
          onConfirm={confirmMaint}
          onCancel={() => setMaintModal(false)}
        />
      )}
    </div>
  )
}
