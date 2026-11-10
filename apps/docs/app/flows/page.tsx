import Diagram, { Legend, type Step } from './diagram';
import CopyButton from '../copy-button';

const TOKEN_NOTE = 'T=$(grep ^ADMIN_TOKEN= .env | cut -d= -f2)  # run from repo root';

const HAPPY: Step[] = [
  { title: 'POST /create-customer', sub: 'curl · Postman', tone: 'slate' },
  { title: 'ACCEPTED · PENDING', sub: 'Ingests → PENDING', sub2: 'delayMs in response', tone: 'amber' },
  { title: 'process-ingest runs', sub: 'Queues → waiting/active', tone: 'blue' },
  { title: 'DONE · customer live', sub: 'Customers search', sub2: 'Logs COMPLETED', tone: 'green' },
];

const RUN_HAPPY = `${TOKEN_NOTE}
# 1. create (use a fresh EXT- ID each repeat)
curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990001","name":"Ada","email":"ada@example.com"}'
# 2. catch it PENDING (repeat until it flips)
curl "http://localhost:3001/admin/ingests?status=PENDING" -H "Authorization: Bearer $T"
# 3. confirm DONE + customer row
curl "http://localhost:3001/admin/ingests?status=DONE" -H "Authorization: Bearer $T"
curl "http://localhost:3001/admin/customers?q=EXT-990001" -H "Authorization: Bearer $T"
# 4. confirm the log
curl "http://localhost:3001/admin/job-runs?queue=customer-fast-lane&status=COMPLETED" -H "Authorization: Bearer $T"`;

const DELAYED: Step[] = [
  { title: 'FAST_LANE_DELAY_MS', title2: '= 20000 in .env', sub: 'restart API', tone: 'slate' },
  { title: 'ACCEPTED · delay 20s', sub: 'terminal + API log', tone: 'amber' },
  { title: 'parked in delayed set', sub: 'Queues → delayed', sub2: 'Ingests → PENDING', tone: 'amber' },
  { title: 'timer fires → DONE', sub: 'Ingests · Logs', tone: 'green' },
];

const RUN_DELAYED = `${TOKEN_NOTE}
# 1. set FAST_LANE_DELAY_MS=20000 in .env, restart API (Ctrl+C, pnpm dev)
# 2. create — response shows "delayMs": 20000
curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990002","name":"Bo","email":"bo@example.com"}'
# 3. catch it mid-flight (within 20s)
curl "http://localhost:3001/admin/ingests?status=PENDING" -H "Authorization: Bearer $T"
curl "http://localhost:3001/admin/queues/fast-lane/jobs?state=delayed" -H "Authorization: Bearer $T"
# 4. wait 20s, then confirm DONE
curl "http://localhost:3001/admin/ingests?status=DONE" -H "Authorization: Bearer $T"`;

const FAILURE: Step[] = [
  { title: 'POST __FAIL__boom', sub: 'training poison', tone: 'slate' },
  { title: 'worker throws', sub: 'attempts climb', sub2: 'exponential backoff', tone: 'blue' },
  { title: 'FAILED after 3 tries', sub: 'lastError on row', sub2: 'Queues → failed', tone: 'red' },
  { title: 'fix + Requeue', sub: 'or sweep-pending', tone: 'amber' },
  { title: 'redelivered → DONE', sub: 'Logs COMPLETED', tone: 'green' },
];

const RUN_FAILURE = `${TOKEN_NOTE}
# 1. poison row (fails 3x, ends FAILED)
curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990098","name":"__FAIL__boom","email":"boom@example.com"}'
# 2. watch attempts climb, then FAILED with "injected fault"
curl "http://localhost:3001/admin/ingests?status=FAILED" -H "Authorization: Bearer $T"
# 3a. requeue one row (copy its id; without a real fix it fails again — that is the drill)
curl -X POST http://localhost:3001/admin/ingests/<INGEST_ID>/requeue -H "Authorization: Bearer $T"
# 3b. or requeue all recoverable FAILED rows at once
curl -X POST http://localhost:3001/admin/ingests/requeue-failed -H "Authorization: Bearer $T"
# 3c. or let the sweeper catch it (FAILED, attempts < 10)
curl -X POST http://localhost:3001/admin/cron/sweep-pending/trigger -H "Authorization: Bearer $T"`;

const CRON: Step[] = [
  { title: 'sweep-pending / 2 min', sub: 'Trigger now = by hand', tone: 'slate' },
  { title: 'PENDING > 60s', title2: 'FAILED < 10 · stale', sub: 'requeued to fast-lane', tone: 'blue' },
  { title: 'aggregate-stats 02:00', sub: 'counts + breakdown', tone: 'blue' },
  { title: 'Overview Latest stats', sub: 'Logs COMPLETED', tone: 'green' },
];

const RUN_CRON = `${TOKEN_NOTE}
# 1. run the nightly count now
curl -X POST http://localhost:3001/admin/cron/aggregate-stats/trigger -H "Authorization: Bearer $T"
# 2. confirm the COMPLETED run + fresh totals
curl "http://localhost:3001/admin/job-runs?queue=customer-cron&status=COMPLETED" -H "Authorization: Bearer $T"
# 3. run the sweeper now (enqueued: 0 when healthy, > 0 after the poison drill)
curl -X POST http://localhost:3001/admin/cron/sweep-pending/trigger -H "Authorization: Bearer $T"`;

function RunIt({ script }: { script: string }) {
  return (
    <>
      <div className="toolbar">
        <CopyButton text={script} />
      </div>
      <pre>{script}</pre>
    </>
  );
}

export default function FlowsDocs() {
  return (
    <>
      <h1>Flows — system graphs for testing scenarios</h1>
      <p>
        Four end-to-end paths through the system. Each flow has a graph plus a copy-paste script:
        run the script in a terminal (repo root) and watch each step land on the dashboard pages
        named under the nodes. Replace EXT- IDs with fresh ones on repeats. Admin calls need
        ADMIN_TOKEN from <code>.env</code>; the first line of every script loads it for you.
      </p>
      <Legend />

      <h2>1. Happy path — create to DONE</h2>
      <p>The first drill every new operator runs.</p>
      <Diagram steps={HAPPY} edges={['accept', 'deliver', 'apply']} />
      <RunIt script={RUN_HAPPY} />

      <h2>2. Delayed demo — hold PENDING with FAST_LANE_DELAY_MS</h2>
      <p>Slow the system down so you can catch rows mid-flight on the inbox screen.</p>
      <Diagram steps={DELAYED} edges={['configure', 'enqueue', 'wait 20s']} />
      <RunIt script={RUN_DELAYED} />

      <h2>3. Failure and recovery — poison row drill</h2>
      <p>Practice the main recovery loop: find the error, fix the cause, requeue.</p>
      <Diagram steps={FAILURE} edges={['inject', 'retry ×3', 'recover', 'verify']} />
      <RunIt script={RUN_FAILURE} />

      <h2>4. Cron loops — sweeper and nightly stats</h2>
      <p>Verify the safety nets run on schedule and on demand.</p>
      <Diagram steps={CRON} edges={['schedule', 'catch up', 'count']} />
      <RunIt script={RUN_CRON} />
    </>
  );
}
