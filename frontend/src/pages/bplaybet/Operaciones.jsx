import { useState } from 'react'
import { Play, RefreshCw, ImageIcon, WrenchIcon, Wifi, Radio } from 'lucide-react'
import Header from '../../components/layout/Header'
import ConfirmModal from '../../components/ui/ConfirmModal'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import { FRONTS, CLIS, ODDFEEDS, AMI_PIPELINES } from '../../data/mock'
import clsx from 'clsx'

const FRONT_IDS  = FRONTS.map(f => f.id)
const CLI_IDS    = CLIS.map(c => c.id)
const SOCKET_ID  = 'socket_fronts'
const ODD_IDS    = ODDFEEDS.map(o => o.id)
const ALL_DC_IDS = [...FRONT_IDS, SOCKET_ID, ...CLI_IDS]

function useAction() {
  const [status, setStatus] = useState('IDLE')
  const run = (ms = 4000) => {
    setStatus('RUNNING')
    setTimeout(() => setStatus('SUCCEEDED'), ms)
  }
  return { status, run, isRunning: status === 'RUNNING' }
}

function Chip({ label, active, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1 rounded-md text-xs font-semibold border transition-colors font-mono',
        active ? accent : 'text-slate-400 border-[#1e2d4a] hover:border-slate-500'
      )}
    >
      {label}
    </button>
  )
}

function GroupedDeploySelector({ selected, onChange }) {
  const accent = 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  const toggle   = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  const allSel   = ALL_DC_IDS.every(id => selected.includes(id))
  const frontSel = FRONT_IDS.every(id => selected.includes(id))
  const cliSel   = CLI_IDS.every(id => selected.includes(id))
  const socketSel = selected.includes(SOCKET_ID)

  const toggleGroup = (ids, allSelected) =>
    onChange(allSelected ? selected.filter(x => !ids.includes(x)) : [...new Set([...selected, ...ids])])

  return (
    <div className="space-y-3">
      <Chip label="Todos" active={allSel} onClick={() => onChange(allSel ? [] : ALL_DC_IDS)} accent={accent} />

      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-1.5">Fronts</p>
        <div className="flex flex-wrap gap-2">
          <Chip label="todos" active={frontSel} onClick={() => toggleGroup(FRONT_IDS, frontSel)} accent={accent} />
          {FRONTS.map(f => <Chip key={f.id} label={f.id} active={selected.includes(f.id)} onClick={() => toggle(f.id)} accent={accent} />)}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-1.5">Sockets</p>
        <Chip label="socket_fronts :8443" active={socketSel} onClick={() => toggle(SOCKET_ID)} accent={accent} />
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-1.5">CLI</p>
        <div className="flex flex-wrap gap-2">
          <Chip label="todos" active={cliSel} onClick={() => toggleGroup(CLI_IDS, cliSel)} accent={accent} />
          {CLIS.map(c => <Chip key={c.id} label={c.id} active={selected.includes(c.id)} onClick={() => toggle(c.id)} accent={accent} />)}
        </div>
      </div>
    </div>
  )
}

function FrontSelector({ selected, onChange, accent }) {
  const allSel = FRONT_IDS.every(id => selected.includes(id))
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="todos" active={allSel} onClick={() => onChange(allSel ? [] : FRONT_IDS)} accent={accent} />
      {FRONTS.map(f => <Chip key={f.id} label={f.id} active={selected.includes(f.id)} onClick={() => toggle(f.id)} accent={accent} />)}
    </div>
  )
}

function OddfeedSelector({ selected, onChange }) {
  const accent = 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  const allSel = ODD_IDS.every(id => selected.includes(id))
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="todos" active={allSel} onClick={() => onChange(allSel ? [] : ODD_IDS)} accent={accent} />
      {ODDFEEDS.map(o => <Chip key={o.id} label={o.name} active={selected.includes(o.id)} onClick={() => toggle(o.id)} accent={accent} />)}
    </div>
  )
}

function PipelineSelector({ selected, onChange }) {
  const accent = 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  const allIds = AMI_PIPELINES.map(p => p.id)
  const allSel = allIds.every(id => selected.includes(id))
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  const toggleAll = () => onChange(allSel ? [] : allIds)

  const groups = [
    { key: 'fronts',   label: 'Fronts'  },
    { key: 'sockets',  label: 'Sockets' },
    { key: 'clis',     label: 'CLI'     },
    { key: 'oddfeeds', label: 'OddFeed' },
  ]

  return (
    <div className="space-y-3">
      <Chip label={allSel ? 'deseleccionar todos' : 'seleccionar todos'} active={allSel} onClick={toggleAll} accent={accent} />
      {groups.map(g => {
        const pipes   = AMI_PIPELINES.filter(p => p.group === g.key)
        const gIds    = pipes.map(p => p.id)
        const gAllSel = gIds.every(id => selected.includes(id))
        const toggleG = () => onChange(gAllSel ? selected.filter(x => !gIds.includes(x)) : [...new Set([...selected, ...gIds])])
        return (
          <div key={g.key}>
            <p className="text-[11px] uppercase tracking-widest text-slate-600 mb-1.5">{g.label}</p>
            <div className="flex flex-wrap gap-2">
              <Chip label="todos" active={gAllSel} onClick={toggleG} accent={accent} />
              {pipes.map(p => <Chip key={p.id} label={p.name} active={selected.includes(p.id)} onClick={() => toggle(p.id)} accent={accent} />)}
            </div>
          </div>
        )
      })}
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
  const deployFronts   = useAction()
  const deploySockets  = useAction()
  const deployOdds     = useAction()
  const buildAmi       = useAction()
  const invalidacion   = useAction()

  const [dcTargets,    setDcTargets]    = useState([])
  const [dfTargets,    setDfTargets]    = useState([])
  const [odTargets,    setOdTargets]    = useState([])
  const [amiPipelines, setAmiPipelines] = useState([])
  const [invTargets,   setInvTargets]   = useState([])

  const [maintTarget, setMaintTarget] = useState(null)
  const [maintModal,  setMaintModal]  = useState(false)
  const [maintStatus, setMaintStatus] = useState({})

  const openMaint = id => { setMaintTarget(id); setMaintModal(true) }
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
          description="Build AMI → Launch Template → Instance Refresh → Invalidación CDN → Notificación — excluye Oddfeeds"
          accentClass="bg-orange-500/10 border-orange-500/20 text-orange-400"
        >
          <GroupedDeploySelector selected={dcTargets} onChange={setDcTargets} />
          <RunButton
            isRunning={deployCompleto.isRunning}
            status={deployCompleto.status}
            onClick={() => dcTargets.length && deployCompleto.run(8000)}
            disabled={dcTargets.length === 0}
            label="Ejecutar Deploy Completo"
          />
        </ActionCard>

        {/* Deploy Fronts | Deploy Sockets | Deploy Oddfeeds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <ActionCard
            icon={RefreshCw}
            title="Deploy Fronts"
            description="Actualiza los fronts seleccionados sin incluir sockets ni CLI"
            accentClass="bg-sky-500/10 border-sky-500/20 text-sky-400"
          >
            <FrontSelector
              selected={dfTargets}
              onChange={setDfTargets}
              accent="bg-sky-500/20 text-sky-400 border-sky-500/30"
            />
            <RunButton
              isRunning={deployFronts.isRunning}
              status={deployFronts.status}
              onClick={() => dfTargets.length && deployFronts.run(5000)}
              disabled={dfTargets.length === 0}
              label="Deploy Fronts"
            />
          </ActionCard>

          <ActionCard
            icon={Wifi}
            title="Deploy Sockets"
            description="Actualiza la ASG de sockets — puerto 8443 en el LB de cada front"
            accentClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          >
            <div className="text-xs text-slate-400 font-mono bg-[#0a1020] rounded-md px-3 py-2 border border-[#1e2d4a]">
              socket_fronts — :8443 (todos los fronts)
            </div>
            <RunButton
              isRunning={deploySockets.isRunning}
              status={deploySockets.status}
              onClick={() => deploySockets.run(4000)}
              label="Deploy Sockets"
            />
          </ActionCard>

          <ActionCard
            icon={Radio}
            title="Deploy Oddfeeds"
            description="Actualiza los feeds de odds — cada uno con su propio LB"
            accentClass="bg-rose-500/10 border-rose-500/20 text-rose-400"
          >
            <OddfeedSelector selected={odTargets} onChange={setOdTargets} />
            <RunButton
              isRunning={deployOdds.isRunning}
              status={deployOdds.status}
              onClick={() => odTargets.length && deployOdds.run(5000)}
              disabled={odTargets.length === 0}
              label="Deploy Oddfeeds"
            />
          </ActionCard>

        </div>

        {/* Build AMI | Invalidación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <ActionCard
            icon={ImageIcon}
            title="Build AMI"
            description="Lanza los pipelines seleccionados — uno por cada ASG (~20 min c/u)"
            accentClass="bg-purple-500/10 border-purple-500/20 text-purple-400"
          >
            <PipelineSelector selected={amiPipelines} onChange={setAmiPipelines} />
            <RunButton
              isRunning={buildAmi.isRunning}
              status={buildAmi.status}
              onClick={() => amiPipelines.length && buildAmi.run(20000)}
              disabled={amiPipelines.length === 0}
              label="Build AMI"
            />
          </ActionCard>

          <ActionCard
            icon={RefreshCw}
            title="Invalidación CDN"
            description="Limpia el caché de CloudFront para los fronts seleccionados"
            accentClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          >
            <FrontSelector
              selected={invTargets}
              onChange={setInvTargets}
              accent="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            />
            <RunButton
              isRunning={invalidacion.isRunning}
              status={invalidacion.status}
              onClick={() => invTargets.length && invalidacion.run(3000)}
              disabled={invTargets.length === 0}
              label="Invalidar"
            />
          </ActionCard>

        </div>

        {/* Mantenimiento */}
        <ActionCard
          icon={WrenchIcon}
          title="Mantenimiento"
          description="Activa la landing de mantenimiento en el front seleccionado"
          accentClass="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {FRONTS.map(f => (
              <div key={f.id} className="flex items-center justify-between bg-[#0a1020] rounded-lg px-3 py-2 border border-[#1e2d4a]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-300 uppercase">{f.id}</span>
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

      {maintModal && (
        <ConfirmModal
          title={`Mantenimiento — ${maintTarget?.toUpperCase()}`}
          description={`Vas a cambiar el modo mantenimiento del front ${maintTarget}. Esta accion afecta a los usuarios en produccion.`}
          onConfirm={confirmMaint}
          onCancel={() => setMaintModal(false)}
        />
      )}
    </div>
  )
}
