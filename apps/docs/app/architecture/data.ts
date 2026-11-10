import type { Step } from '../flows/diagram';
import type { FNode } from './detail';

export const DELIVERY: Step[] = [
  { title: '3rd party sender', sub: 'POST create/update', tone: 'slate' },
  { title: 'API · NestJS :3001', sub: 'write inbox PENDING', sub2: 'enqueue BullMQ job', tone: 'amber' },
  { title: 'Redis · BullMQ :6379', sub: 'fast-lane queue', sub2: 'delayed set (demo 20s)', tone: 'amber' },
  { title: 'Worker · NestJS', sub: 'fast-lane processor', tone: 'blue' },
  { title: 'PostgreSQL :5432', sub: 'upsert customer', sub2: 'DONE + job run', tone: 'green' },
];

export const ACCEPT: FNode[] = [
  {
    kind: 'box', title: '1 · Guard + validate', tone: 'slate',
    code: ['POST create/update → accept()', 'ApiKeyGuard checks x-api-key', 'CustomerDto: id, name, email'],
  },
  {
    kind: 'box', title: '2 · Store inbox PENDING', tone: 'amber',
    code: ['prisma.customerIngest.create', 'set status = PENDING', 'operation CREATE | UPDATE'],
    edge: 'valid → 202 route',
  },
  {
    kind: 'box', title: '3 · Enqueue fast-lane', tone: 'amber',
    code: ['fastLane.add PROCESS_INGEST', 'jobId ingest-<id>-0', 'delay = FAST_LANE_DELAY_MS'],
    edge: 'stored',
  },
  {
    kind: 'diamond', title: 'Redis up in 3s?', tone: 'amber', note: 'race: add() vs 3s timeout',
    branch: { edge: 'no (down/slow)', steps: [{ title: 'Still ACCEPTED', title2: 'stays PENDING', sub: 'sweeper rescues after 60s', tone: 'red' }] },
    edge: 'attempt',
  },
  {
    kind: 'box', title: '4 · Return ACCEPTED', tone: 'green',
    code: ['{ ingestId, ACCEPTED, delayMs }', 'server log: delay=Ns'],
    edge: 'yes',
  },
];

export const PROCESS: FNode[] = [
  {
    kind: 'box', title: '1 · Load inbox row', tone: 'blue',
    code: ['process(job) in fast-lane', 'findUnique by ingestId'],
  },
  {
    kind: 'diamond', title: 'Row exists?', tone: 'amber',
    branch: { edge: 'no', steps: [{ title: 'Skip: not found', sub: 'return, no crash', tone: 'slate' }] },
    edge: 'loaded',
  },
  {
    kind: 'diamond', title: 'Already DONE?', tone: 'amber',
    branch: { edge: 'yes', steps: [{ title: 'Skip: idempotent', sub: 'return already-done', tone: 'slate' }] },
    edge: 'yes',
  },
  {
    kind: 'box', title: '2 · Mark PROCESSING', tone: 'blue',
    code: ['update status = PROCESSING', 'attempts + 1'],
    edge: 'no',
  },
  {
    kind: 'diamond', title: 'Name __FAIL__…?', tone: 'red',
    branch: {
      edge: 'yes (throw)',
      steps: [
        { title: 'Throw injected fault', sub: 'retry ×3, exp backoff 2s', tone: 'red' },
        { title: '3/3 exhausted → FAILED', title2: 'set FAILED + lastError', sub: 'recordJobRun FAILED', tone: 'red' },
      ],
    },
    edge: 'checked',
  },
  {
    kind: 'box', title: '3 · Tx: newer-wins check', tone: 'blue',
    code: ['findUnique customer', 'lastIngestAt > createdAt ?'],
    edge: 'no (healthy)',
  },
  {
    kind: 'diamond', title: 'Newer applied?', tone: 'amber',
    branch: { edge: 'yes', steps: [{ title: 'Stale: keep newer', sub: 'skip overwrite, still DONE', tone: 'amber' }] },
    edge: 'compare',
  },
  {
    kind: 'box', title: '4 · Upsert + DONE', tone: 'green',
    code: ['upsert customer by externalId', 'update DONE + processedAt', 'recordJobRun COMPLETED'],
    edge: 'no / applied',
  },
];

export const SWEEP: FNode[] = [
  {
    kind: 'box', title: 'Every 2 min */2 * * * *', tone: 'slate',
    code: ['scheduler.service registers', 'cron queue job sweep-pending'],
  },
  {
    kind: 'diamond', title: 'Stuck rows?', tone: 'amber',
    note: 'PENDING>60s · FAILED att<10 · PROC stale>10m',
    branch: { edge: 'no', steps: [{ title: 'enqueued: 0', sub: 'nothing to rescue', tone: 'green' }] },
    edge: 'scan inbox',
  },
  {
    kind: 'box', title: 'Requeue bulk', tone: 'blue',
    code: ['addBulk PROCESS_INGEST', 'jobId ingest-<id>-<attempts>', 'dedupe by jobId'],
    edge: 'yes, found',
  },
  {
    kind: 'box', title: 'Report + record', tone: 'green',
    code: ['return { enqueued: N }', 'recordJobRun COMPLETED'],
    edge: 'done',
  },
];

export const STATS: FNode[] = [
  {
    kind: 'box', title: 'Nightly 02:00 CRON_TZ', tone: 'slate',
    code: ['upsertJobScheduler idempotent', 'cron queue job aggregate-stats'],
  },
  {
    kind: 'box', title: 'Count + prune', tone: 'blue',
    code: ['customer.count', 'groupBy status → ingest { }', 'prune jobRun older than 30d'],
    edge: 'run',
  },
  {
    kind: 'box', title: 'Feed Overview', tone: 'green',
    code: ['{ customers, ingest, pruned }', 'Latest stats card reads it'],
    edge: 'store',
  },
];

export const ADMIN: Array<[string, string, string]> = [
  ['POST /create-customer, /update-customer', 'controller → accept()', 'create PENDING row; fastLane.add + delay'],
  ['GET /admin/ingests?status=&page=', 'count + findMany where status', 'order createdAt desc, 50/page'],
  ['POST /admin/ingests/:id/requeue', 'findUnique; fastLane.add jobId ingest-<id>-<attempts>', 'status flips on pickup, not here'],
  ['POST /admin/ingests/requeue-failed', 'findMany FAILED att<10, take 5000', 'addBulk same jobId scheme'],
  ['POST /admin/fast-lane/jobs/:id/retry', 'getJob(id) → job.retry()', '404 if aged out of Redis'],
  ['POST /admin/cron/:name/trigger', 'cron.add(name, {triggeredBy:manual})', 'sweep-pending | aggregate-stats'],
  ['GET /admin/queues/:lane/jobs', 'getJobs(state) + getJobCounts', 'lane fast-lane|cron → customer-* queues'],
  ['GET /admin/customers?q=', 'count + findMany', 'externalId = q OR email startsWith q'],
  ['GET /admin/job-runs', 'count + findMany where queue+status', 'order finishedAt desc'],
  ['GET /admin/cron', 'getJobSchedulers + last jobRun', 'pattern, tz, last result per schedule'],
];

export const INVENTORY: Array<[string, string, string, string]> = [
  ['API', 'NestJS', ':3001', 'accept 3rd-party calls, serve admin reads + actions'],
  ['Worker', 'NestJS + BullMQ', '—', 'fast-lane processor, cron processor (sweep, stats)'],
  ['Dashboard', 'Next.js', ':3000', 'operator UI: Overview, Queues, Cron, Ingests, Logs, Customers'],
  ['Docs', 'Next.js (this app)', ':3002', 'static operator guide, zero backend calls'],
  ['Redis + BullMQ', 'Redis', ':6379', 'fast-lane + cron queues, delayed set, job state'],
  ['PostgreSQL', 'Postgres + Prisma', ':5432', 'inbox rows, customers truth, job-run history'],
];
