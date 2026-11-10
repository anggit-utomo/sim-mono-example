import Diagram, { Legend } from '../flows/diagram';
import type { Step } from '../flows/diagram';

const DELIVERY: Step[] = [
  { title: '3rd party sender', sub: 'POST create/update', tone: 'slate' },
  { title: 'API · NestJS :3001', sub: 'write inbox PENDING', sub2: 'enqueue BullMQ job', tone: 'amber' },
  { title: 'Redis · BullMQ :6379', sub: 'fast-lane queue', sub2: 'delayed set (demo 20s)', tone: 'amber' },
  { title: 'Worker · NestJS', sub: 'fast-lane processor', tone: 'blue' },
  { title: 'PostgreSQL :5432', sub: 'upsert customer', sub2: 'DONE + job run', tone: 'green' },
];

const READ: Step[] = [
  { title: 'Operator', sub: 'human in browser', tone: 'slate' },
  { title: 'Dashboard · Next :3000', sub: 'Overview Queues Cron', sub2: 'Ingests Logs Customers', tone: 'slate' },
  { title: 'API · /admin/* :3001', sub: 'reads + trigger/retry', sub2: 'requeue actions', tone: 'blue' },
  { title: 'PostgreSQL + Redis', sub: 'source of truth', sub2: 'live queue state', tone: 'green' },
];

const CRONLOOP: Step[] = [
  { title: 'Worker · cron lane', sub: 'sweep + stats jobs', tone: 'slate' },
  { title: 'sweep → fast-lane', sub: 'requeue stuck rows', sub2: 'via Redis BullMQ', tone: 'blue' },
  { title: 'stats → job run', sub: 'counts + breakdown', sub2: 'stored in PostgreSQL', tone: 'blue' },
  { title: 'Overview Latest stats', sub: 'dashboard reads it', tone: 'green' },
];

const INVENTORY: Array<[string, string, string, string]> = [
  ['API', 'NestJS', ':3001', 'accept 3rd-party calls, serve admin reads + actions'],
  ['Worker', 'NestJS + BullMQ', '—', 'fast-lane processor, cron processor (sweep, stats)'],
  ['Dashboard', 'Next.js', ':3000', 'operator UI: Overview, Queues, Cron, Ingests, Logs, Customers'],
  ['Docs', 'Next.js (this app)', ':3002', 'static operator guide, zero backend calls'],
  ['Redis + BullMQ', 'Redis', ':6379', 'fast-lane + cron queues, delayed set, job state'],
  ['PostgreSQL', 'Postgres + Prisma', ':5432', 'inbox rows, customers truth, job-run history'],
];

export default function ArchitectureDocs() {
  return (
    <>
      <h1>Architecture — whole system, one page</h1>
      <p>
        Every box names the real service and port. Delivery always flows down path A
        (fast-lane forever); operators watch through path B; path C is the safety net.
        See <a href="/flows">Flows</a> for the copy-paste drills of each path.
      </p>
      <Legend />

      <h2>A. Delivery path — 3rd party to customer row <span className="lane">FAST-LANE</span></h2>
      <Diagram steps={DELIVERY} edges={['POST', 'enqueue', 'consume', 'upsert']} />

      <h2>B. Operator read path — screen to source of truth</h2>
      <Diagram steps={READ} edges={['browse', 'GET/POST', 'query']} />

      <h2>C. Cron loop — safety net and counting <span className="lane">CRON</span></h2>
      <Diagram steps={CRONLOOP} edges={['schedule', 'rescue', 'report']} />

      <h2>Service inventory</h2>
      <table>
        <thead>
          <tr><th>Service</th><th>Tech</th><th>Port</th><th>Role</th></tr>
        </thead>
        <tbody>
          {INVENTORY.map(([s, t, p, r]) => (
            <tr key={s}>
              <td>{s}</td><td>{t}</td><td>{p}</td><td>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
