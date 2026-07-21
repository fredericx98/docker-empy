import { useLocation } from 'react-router-dom'
import { RefreshCw, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

const PAGE_TITLES = {
  '/':               { title: 'Overview',         sub: 'Estado general de BPlayBet' },
  '/monitoring':     { title: 'Monitoreo',         sub: 'Salud y latencia de servicios' },
  '/infrastructure': { title: 'Infraestructura',   sub: 'Recursos AWS activos' },
  '/analytics':      { title: 'Analytics',         sub: 'Métricas de negocio y performance' },
  '/alerts':         { title: 'Alertas',           sub: 'Incidentes y alarmas activas' },
  '/step-functions': { title: 'Step Functions',    sub: 'Workflows y ejecuciones' },
  '/config':         { title: 'Configuración',     sub: 'Parámetros del sistema' },
}

export default function Header() {
  const { pathname } = useLocation()
  const qc = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(new Date())
  const page = PAGE_TITLES[pathname] ?? { title: 'BPlayBet Monitor', sub: '' }

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await qc.invalidateQueries()
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white leading-tight">{page.title}</h1>
        {page.sub && <p className="text-xs text-gray-500 mt-0.5">{page.sub}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{format(now, "d MMM yyyy · HH:mm", { locale: es })}</span>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>
    </header>
  )
}
