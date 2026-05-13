import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

export const FRONTS = [
  { id: 'mdz', name: 'Mendoza',             status: 'HEALTHY',     version: 'v2.4.1', lastDeployedAt: '2026-05-11T10:32:00Z', lastInvalidationAt: '2026-05-11T10:35:00Z', maintenance: false },
  { id: 'ju',  name: 'Jujuy',               status: 'HEALTHY',     version: 'v2.4.1', lastDeployedAt: '2026-05-11T10:32:00Z', lastInvalidationAt: '2026-05-11T10:35:00Z', maintenance: false },
  { id: 'py',  name: 'Paraguay',            status: 'DEGRADED',    version: 'v2.3.9', lastDeployedAt: '2026-05-08T14:20:00Z', lastInvalidationAt: '2026-05-08T14:25:00Z', maintenance: false },
  { id: 'par', name: 'Paraná',              status: 'HEALTHY',     version: 'v2.4.1', lastDeployedAt: '2026-05-11T10:32:00Z', lastInvalidationAt: '2026-05-11T10:35:00Z', maintenance: false },
  { id: 'sde', name: 'Santiago del Estero', status: 'MAINTENANCE', version: 'v2.4.0', lastDeployedAt: '2026-05-10T09:15:00Z', lastInvalidationAt: '2026-05-10T09:20:00Z', maintenance: true  },
]

export const INFRA = {
  asg:         { total: 15, running: 12, healthy: 11 },
  rds:         { status: 'HEALTHY', latencyMs: 8, connections: 42, storageUsedPct: 68 },
  lastAmiBuild: { timestamp: '2026-05-10T09:15:00Z', version: 'ami-0a1b2c3d4e5f67890', status: 'SUCCEEDED' },
}

export const ACTION_TYPES = [
  { id: 'DEPLOY_COMPLETO', label: 'Deploy Completo' },
  { id: 'DEPLOY_FRONT',    label: 'Deploy Front'    },
  { id: 'INVALIDACION',    label: 'Invalidación CDN' },
  { id: 'BUILD_AMI',       label: 'Build AMI'       },
  { id: 'MANTENIMIENTO',   label: 'Mantenimiento'   },
]

export const EXECUTIONS = [
  { id: 'exec-001', type: 'DEPLOY_COMPLETO', target: 'all', status: 'SUCCEEDED', startedAt: '2026-05-11T10:30:00Z', finishedAt: '2026-05-11T10:47:00Z', triggeredBy: 'admin@bplaybet.com' },
  { id: 'exec-002', type: 'INVALIDACION',    target: 'mdz', status: 'SUCCEEDED', startedAt: '2026-05-11T09:15:00Z', finishedAt: '2026-05-11T09:17:00Z', triggeredBy: 'ops@bplaybet.com'   },
  { id: 'exec-003', type: 'BUILD_AMI',       target: '—',   status: 'FAILED',    startedAt: '2026-05-10T14:20:00Z', finishedAt: '2026-05-10T14:38:00Z', triggeredBy: 'admin@bplaybet.com' },
  { id: 'exec-004', type: 'MANTENIMIENTO',   target: 'sde', status: 'SUCCEEDED', startedAt: '2026-05-10T10:00:00Z', finishedAt: '2026-05-10T10:01:00Z', triggeredBy: 'admin@bplaybet.com' },
  { id: 'exec-005', type: 'DEPLOY_FRONT',    target: 'py',  status: 'SUCCEEDED', startedAt: '2026-05-09T16:45:00Z', finishedAt: '2026-05-09T16:58:00Z', triggeredBy: 'dev@bplaybet.com'   },
  { id: 'exec-006', type: 'INVALIDACION',    target: 'all', status: 'SUCCEEDED', startedAt: '2026-05-09T16:59:00Z', finishedAt: '2026-05-09T17:01:00Z', triggeredBy: 'dev@bplaybet.com'   },
  { id: 'exec-007', type: 'DEPLOY_COMPLETO', target: 'ju',  status: 'SUCCEEDED', startedAt: '2026-05-08T11:00:00Z', finishedAt: '2026-05-08T11:18:00Z', triggeredBy: 'admin@bplaybet.com' },
  { id: 'exec-008', type: 'BUILD_AMI',       target: '—',   status: 'SUCCEEDED', startedAt: '2026-05-08T09:00:00Z', finishedAt: '2026-05-08T09:22:00Z', triggeredBy: 'admin@bplaybet.com' },
  { id: 'exec-009', type: 'MANTENIMIENTO',   target: 'par', status: 'SUCCEEDED', startedAt: '2026-05-07T20:00:00Z', finishedAt: '2026-05-07T20:01:00Z', triggeredBy: 'admin@bplaybet.com' },
  { id: 'exec-010', type: 'DEPLOY_FRONT',    target: 'mdz', status: 'FAILED',    startedAt: '2026-05-07T15:30:00Z', finishedAt: '2026-05-07T15:35:00Z', triggeredBy: 'dev@bplaybet.com'   },
  { id: 'exec-011', type: 'INVALIDACION',    target: 'par', status: 'SUCCEEDED', startedAt: '2026-05-06T12:00:00Z', finishedAt: '2026-05-06T12:02:00Z', triggeredBy: 'ops@bplaybet.com'   },
  { id: 'exec-012', type: 'DEPLOY_COMPLETO', target: 'all', status: 'SUCCEEDED', startedAt: '2026-05-05T09:00:00Z', finishedAt: '2026-05-05T09:19:00Z', triggeredBy: 'admin@bplaybet.com' },
]

export const RECENT_ACTIVITY = EXECUTIONS.slice(0, 5)

export function timeAgo(isoString) {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: es })
}

export function fmtDate(isoString) {
  return format(new Date(isoString), 'dd/MM HH:mm')
}

export function duration(startedAt, finishedAt) {
  if (!finishedAt) return '—'
  const diff = Math.floor((new Date(finishedAt) - new Date(startedAt)) / 1000)
  if (diff < 60) return `${diff}s`
  return `${Math.floor(diff / 60)}m ${diff % 60}s`
}
