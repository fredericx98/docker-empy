import { useState, useEffect, useRef } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { FRONTS, INFRA } from '../../data/mock'
import clsx from 'clsx'

function getOverallStatus(fronts) {
  if (fronts.some(f => f.status === 'DOWN')) return 'RED'
  if (fronts.some(f => f.status === 'DEGRADED')) return 'YELLOW'
  if (fronts.some(f => f.status === 'MAINTENANCE')) return 'YELLOW'
  return 'GREEN'
}

const STATUS_CONFIG = {
  GREEN:  { label: 'Todos los sistemas operativos', bg: 'bg-emerald-950', dot: 'bg-emerald-400', text: 'text-emerald-300', border: 'border-emerald-500/20', glow: 'shadow-[0_0_80px_rgba(52,211,153,0.4)]' },
  YELLOW: { label: 'Degradado — revisar fronts',   bg: 'bg-yellow-950',  dot: 'bg-yellow-400',  text: 'text-yellow-300',  border: 'border-yellow-500/20',  glow: 'shadow-[0_0_80px_rgba(250,204,21,0.4)]'  },
  RED:    { label: 'Atención — sistema caído',      bg: 'bg-red-950',     dot: 'bg-red-400',     text: 'text-red-300',     border: 'border-red-500/20',     glow: 'shadow-[0_0_80px_rgba(248,113,113,0.4)]' },
}

const FRONT_STATUS_DOT = {
  HEALTHY:     'bg-emerald-400',
  DEGRADED:    'bg-yellow-400',
  DOWN:        'bg-red-400',
  MAINTENANCE: 'bg-purple-400',
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

export default function StatusBar() {
  const overall = getOverallStatus(FRONTS)
  const cfg     = STATUS_CONFIG[overall]
  const healthyCount = FRONTS.filter(f => f.status === 'HEALTHY').length

  const [showFullscreen, setShowFullscreen] = useState(false)
  const fullscreenRef = useRef(null)

  const enterFullscreen = () => {
    setShowFullscreen(true)
    setTimeout(async () => {
      try { await fullscreenRef.current?.requestFullscreen() } catch {}
    }, 50)
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    setShowFullscreen(false)
  }

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setShowFullscreen(false) }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <>
      {/* ── Barra de estado ── */}
      <div className={clsx(
        'flex items-center justify-between px-5 py-2 mb-6 rounded-xl border text-sm',
        'bg-[#0d1526]', cfg.border
      )}>
        {/* Status */}
        <div className="flex items-center gap-3">
          <span className={clsx('w-2 h-2 rounded-full animate-pulse', cfg.dot)} />
          <span className={clsx('font-semibold text-xs uppercase tracking-widest', cfg.text)}>
            {cfg.label}
          </span>
        </div>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-5 text-xs text-slate-500">
          <span>{healthyCount}/{FRONTS.length} fronts OK</span>
          <span>RDS {INFRA.rds.latencyMs}ms</span>
          <span>ASG {INFRA.asg.running}/{INFRA.asg.total}</span>
        </div>

        {/* Fullscreen button */}
        <button
          onClick={enterFullscreen}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition-colors border border-[#1e2d4a] hover:border-slate-500 px-2.5 py-1 rounded-md"
        >
          <Maximize2 size={12} />
          <span className="hidden sm:inline">Pantalla completa</span>
        </button>
      </div>

      {/* ── Fullscreen semáforo ── */}
      {showFullscreen && (
        <div
          ref={fullscreenRef}
          className={clsx(
            'fixed inset-0 z-50 flex flex-col items-center justify-center gap-10',
            cfg.bg
          )}
        >
          {/* Exit button */}
          <button
            onClick={exitFullscreen}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          {/* Semáforo */}
          <div className="flex flex-col items-center gap-5 bg-black/30 rounded-3xl px-10 py-8 border border-white/10">
            <div className="flex flex-col gap-4">
              {(['RED', 'YELLOW', 'GREEN']).map(s => (
                <div
                  key={s}
                  className={clsx(
                    'w-20 h-20 rounded-full border-4 border-black/40 transition-all duration-500',
                    overall === s
                      ? clsx(STATUS_CONFIG[s].dot, STATUS_CONFIG[s].glow, 'opacity-100')
                      : 'bg-white/5 opacity-20'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Status label */}
          <div className="text-center">
            <p className={clsx('text-4xl font-bold uppercase tracking-widest', cfg.text)}>
              {cfg.label}
            </p>
          </div>

          {/* Per-front grid */}
          <div className="flex gap-8">
            {FRONTS.map(f => (
              <div key={f.id} className="flex flex-col items-center gap-2">
                <div className={clsx('w-4 h-4 rounded-full', FRONT_STATUS_DOT[f.status] ?? 'bg-slate-500')} />
                <span className="text-xs font-mono uppercase text-white/50">{f.id}</span>
              </div>
            ))}
          </div>

          {/* Clock */}
          <p className="text-white/30 text-lg">
            <Clock />
          </p>

          <p className="absolute bottom-5 text-white/20 text-xs">ESC para salir</p>
        </div>
      )}
    </>
  )
}
