import { subHours, subMinutes, format } from 'date-fns'

/* ── Utility ─────────────────────────────────────────────────────────── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randF = (min, max, d = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(d))

/* ── Time series helpers ─────────────────────────────────────────────── */
export function timeSeriesHours(hours = 24, valueRange = [80, 200]) {
  return Array.from({ length: hours }, (_, i) => ({
    time: format(subHours(new Date(), hours - 1 - i), 'HH:mm'),
    value: rand(...valueRange),
  }))
}

export function timeSeriesHoursMulti(hours = 24, series) {
  return Array.from({ length: hours }, (_, i) => {
    const obj = { time: format(subHours(new Date(), hours - 1 - i), 'HH:mm') }
    series.forEach(({ key, range }) => { obj[key] = rand(...range) })
    return obj
  })
}

/* ── Services ────────────────────────────────────────────────────────── */
export const SERVICES = [
  { id: 'api-gw',       name: 'API Gateway',          status: 'healthy',  latency: 42,  uptime: 99.98, rps: 1240, region: 'us-east-1', type: 'gateway'  },
  { id: 'payment',      name: 'Payment Service',       status: 'healthy',  latency: 118, uptime: 99.95, rps: 87,   region: 'us-east-1', type: 'ecs'      },
  { id: 'odds',         name: 'Odds Engine',           status: 'warning',  latency: 274, uptime: 99.80, rps: 530,  region: 'us-east-1', type: 'ecs'      },
  { id: 'user-svc',     name: 'User Service',          status: 'healthy',  latency: 34,  uptime: 99.99, rps: 940,  region: 'us-east-1', type: 'ecs'      },
  { id: 'event-svc',    name: 'Event Service',         status: 'healthy',  latency: 61,  uptime: 99.95, rps: 320,  region: 'us-east-1', type: 'ecs'      },
  { id: 'bet-proc',     name: 'Bet Processing',        status: 'healthy',  latency: 94,  uptime: 99.97, rps: 210,  region: 'us-east-1', type: 'lambda'   },
  { id: 'notif',        name: 'Notification Service',  status: 'healthy',  latency: 78,  uptime: 99.90, rps: 155,  region: 'us-east-1', type: 'lambda'   },
  { id: 'fraud',        name: 'Fraud Detection',       status: 'healthy',  latency: 184, uptime: 99.85, rps: 210,  region: 'us-east-1', type: 'lambda'   },
  { id: 'admin-api',    name: 'Admin API',             status: 'healthy',  latency: 52,  uptime: 99.99, rps: 24,   region: 'us-east-1', type: 'ecs'      },
  { id: 'cache',        name: 'Cache (ElastiCache)',   status: 'healthy',  latency: 4,   uptime: 99.99, rps: 4800, region: 'us-east-1', type: 'cache'    },
  { id: 'rds-primary',  name: 'RDS Primary',           status: 'healthy',  latency: 8,   uptime: 99.99, rps: 620,  region: 'us-east-1', type: 'database' },
  { id: 'rds-replica',  name: 'RDS Replica',           status: 'healthy',  latency: 6,   uptime: 99.99, rps: 440,  region: 'us-east-1', type: 'database' },
]

/* ── Infrastructure resources ───────────────────────────────────────── */
export const INFRA = {
  ecs: [
    { name: 'bplaybet-api-cluster',     services: 6, running: 6,  cpu: 42, memory: 58, env: 'prod' },
    { name: 'bplaybet-worker-cluster',  services: 4, running: 4,  cpu: 31, memory: 44, env: 'prod' },
    { name: 'bplaybet-admin-cluster',   services: 2, running: 2,  cpu: 18, memory: 29, env: 'prod' },
  ],
  rds: [
    { id: 'bplaybet-db-prod',    engine: 'Aurora MySQL 8.0', role: 'Primary',  status: 'available', storage: '500 GB', iops: 3000, az: 'us-east-1a' },
    { id: 'bplaybet-db-replica', engine: 'Aurora MySQL 8.0', role: 'Replica',  status: 'available', storage: '500 GB', iops: 3000, az: 'us-east-1b' },
  ],
  elasticache: [
    { id: 'bplaybet-redis-prod', engine: 'Redis 7.x', nodes: 3, status: 'available', memory: '6.38 GB', az: 'us-east-1a/b/c' },
  ],
  lambdas: [
    { name: 'bplaybet-bet-processor',   runtime: 'Python 3.12', memory: '512 MB', timeout: 30, invocations: 18400, errors: 12,  p99: 94  },
    { name: 'bplaybet-fraud-check',     runtime: 'Python 3.12', memory: '1024 MB',timeout: 60, invocations: 18400, errors: 3,   p99: 184 },
    { name: 'bplaybet-notification',    runtime: 'Python 3.12', memory: '256 MB', timeout: 15, invocations: 13200, errors: 8,   p99: 78  },
    { name: 'bplaybet-odds-updater',    runtime: 'Python 3.12', memory: '512 MB', timeout: 30, invocations: 45600, errors: 2,   p99: 55  },
    { name: 'bplaybet-report-gen',      runtime: 'Python 3.12', memory: '2048 MB',timeout: 300,invocations: 180,   errors: 0,   p99: 4200},
    { name: 'bplaybet-health-check',    runtime: 'Python 3.12', memory: '128 MB', timeout: 10, invocations: 8640,  errors: 0,   p99: 12  },
    { name: 'bplaybet-step-trigger',    runtime: 'Python 3.12', memory: '128 MB', timeout: 15, invocations: 1440,  errors: 0,   p99: 23  },
  ],
  s3: [
    { name: 'bplaybet-frontend-prod', objects: '1,840', size: '148 MB', access: 'CloudFront Only' },
    { name: 'bplaybet-reports',       objects: '23,410',size: '8.2 GB', access: 'Private'        },
    { name: 'bplaybet-backups',       objects: '4,200', size: '92 GB',  access: 'Private'        },
    { name: 'bplaybet-assets',        objects: '6,720', size: '2.4 GB', access: 'CloudFront Only' },
  ],
}

/* ── Alerts ──────────────────────────────────────────────────────────── */
export const ALERTS = [
  { id: 'a1', severity: 'critical', title: 'Odds Engine latencia alta',    service: 'odds',      msg: 'P99 > 250ms en los últimos 15 min', time: subMinutes(new Date(), 12), ack: false },
  { id: 'a2', severity: 'warning',  title: 'CPU cluster worker al 78%',    service: 'ecs',       msg: 'bplaybet-worker-cluster CPU escalando', time: subMinutes(new Date(), 34), ack: false },
  { id: 'a3', severity: 'warning',  title: 'Error rate Fraud +0.04%',      service: 'fraud',     msg: 'Tasa de error leve en fraud-check', time: subMinutes(new Date(), 61), ack: true  },
  { id: 'a4', severity: 'info',     title: 'Deploy completado',            service: 'api-gw',    msg: 'v2.14.3 desplegada correctamente', time: subMinutes(new Date(), 95), ack: true  },
  { id: 'a5', severity: 'info',     title: 'Backup completado',            service: 'rds',       msg: 'Snapshot diario bplaybet-db-prod OK', time: subHours(new Date(), 3), ack: true  },
  { id: 'a6', severity: 'critical', title: 'Step Function falló',          service: 'step-fn',   msg: 'monitoring-daily-check: 1 ejecución fallida', time: subHours(new Date(), 5), ack: false },
]

/* ── Step Functions ──────────────────────────────────────────────────── */
export const STEP_FNS = [
  {
    name: 'bplaybet-monitoring-daily',
    arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:bplaybet-monitoring-daily',
    executions: [
      { id: 'ex-001', status: 'succeeded', startTime: subHours(new Date(), 1),   duration: '1m 24s' },
      { id: 'ex-002', status: 'succeeded', startTime: subHours(new Date(), 2),   duration: '1m 18s' },
      { id: 'ex-003', status: 'failed',    startTime: subHours(new Date(), 5),   duration: '0m 42s' },
      { id: 'ex-004', status: 'succeeded', startTime: subHours(new Date(), 6),   duration: '1m 31s' },
    ],
  },
  {
    name: 'bplaybet-bet-settlement',
    arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:bplaybet-bet-settlement',
    executions: [
      { id: 'ex-010', status: 'running',   startTime: subMinutes(new Date(), 3),  duration: '—' },
      { id: 'ex-011', status: 'succeeded', startTime: subMinutes(new Date(), 35), duration: '0m 48s' },
      { id: 'ex-012', status: 'succeeded', startTime: subMinutes(new Date(), 68), duration: '0m 51s' },
    ],
  },
  {
    name: 'bplaybet-report-generation',
    arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:bplaybet-report-generation',
    executions: [
      { id: 'ex-020', status: 'succeeded', startTime: subHours(new Date(), 4),  duration: '7m 12s' },
      { id: 'ex-021', status: 'succeeded', startTime: subHours(new Date(), 28), duration: '6m 58s' },
    ],
  },
  {
    name: 'bplaybet-fraud-review',
    arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:bplaybet-fraud-review',
    executions: [
      { id: 'ex-030', status: 'running',   startTime: subMinutes(new Date(), 8),  duration: '—' },
      { id: 'ex-031', status: 'running',   startTime: subMinutes(new Date(), 22), duration: '—' },
      { id: 'ex-032', status: 'succeeded', startTime: subMinutes(new Date(), 55), duration: '2m 14s' },
    ],
  },
]

/* ── Analytics ───────────────────────────────────────────────────────── */
export const ANALYTICS = {
  betsPerHour:   timeSeriesHours(24, [800, 1800]),
  apiLatency:    timeSeriesHoursMulti(24, [
    { key: 'p50',  range: [25, 60]  },
    { key: 'p95',  range: [80, 180] },
    { key: 'p99',  range: [120, 280]},
  ]),
  activeUsers:   timeSeriesHours(24, [2800, 6400]),
  errorRate:     timeSeriesHours(24, [0, 8]).map(p => ({ ...p, value: randF(0, 0.8) })),
  revenue:       timeSeriesHours(24, [40000, 120000]),
  topEvents: [
    { event: 'Liga MX · Tigres vs América',   bets: 4821, volume: '$214,500' },
    { event: 'NBA · Lakers vs Celtics',        bets: 3940, volume: '$189,200' },
    { event: 'Champions · Real Madrid vs PSG', bets: 3210, volume: '$156,800' },
    { event: 'NFL · Chiefs vs Eagles',         bets: 2780, volume: '$132,400' },
    { event: 'MLB · Yankees vs Red Sox',       bets: 1950, volume: '$88,100'  },
  ],
}

/* ── Config / Feature Flags ──────────────────────────────────────────── */
export const CONFIG = {
  featureFlags: [
    { key: 'live_betting',        label: 'Live Betting',         enabled: true,  env: 'prod' },
    { key: 'cashout',             label: 'Cash Out',             enabled: true,  env: 'prod' },
    { key: 'parlay_builder',      label: 'Parlay Builder',       enabled: true,  env: 'prod' },
    { key: 'same_game_parlay',    label: 'Same Game Parlay',     enabled: false, env: 'prod' },
    { key: 'boost_promotions',    label: 'Boost Promotions',     enabled: true,  env: 'prod' },
    { key: 'crypto_payments',     label: 'Crypto Payments',      enabled: false, env: 'prod' },
    { key: 'virtual_sports',      label: 'Virtual Sports',       enabled: true,  env: 'prod' },
    { key: 'ml_recommendations',  label: 'ML Recommendations',   enabled: false, env: 'prod' },
  ],
  params: [
    { key: 'MAX_BET_AMOUNT',           value: '$50,000',   editable: true  },
    { key: 'MIN_BET_AMOUNT',           value: '$1.00',     editable: true  },
    { key: 'MAX_PAYOUT',               value: '$500,000',  editable: true  },
    { key: 'SESSION_TIMEOUT_MINUTES',  value: '30',        editable: true  },
    { key: 'ODDS_REFRESH_SECONDS',     value: '5',         editable: true  },
    { key: 'FRAUD_SCORE_THRESHOLD',    value: '0.75',      editable: true  },
    { key: 'AWS_REGION',               value: 'us-east-1', editable: false },
    { key: 'ENVIRONMENT',              value: 'production', editable: false },
  ],
}
