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
  { title: 'worker throws ×3', sub: 'attempts 1 → 3', sub2: 'ends FAILED', tone: 'red' },
  { title: 'Requeue replays it', sub: 'same payload fails again', sub2: 'attempts 4 → 6 …', tone: 'amber' },
  { title: 'resend fixed data', sub: 'update-customer', sub2: 'good name, same ID', tone: 'blue' },
  { title: 'DONE · customer live', sub: 'newest-wins applied', tone: 'green' },
];

const RUN_FAILURE = `${TOKEN_NOTE}
# 1. poison row (fails 3x, ends FAILED — the name itself is the fault)
curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990098","name":"__FAIL__boom","email":"boom@example.com"}'
# 2. watch attempts 1 → 3, then FAILED with "injected fault"
curl "http://localhost:3001/admin/ingests?status=FAILED" -H "Authorization: Bearer $T"
# 3. requeue replays the SAME payload, so it fails again (attempts 4 → 6).
#    That is the point: the loop is visible and controllable, not magic.
curl -X POST http://localhost:3001/admin/ingests/<INGEST_ID>/requeue -H "Authorization: Bearer $T"
#    NOTE: every cycle adds attempts; past 10 the sweeper and requeue-all
#    stop picking the row up — don't loop a poison row forever.
# 4. recover for real: resend FIXED data for the same ID (new ingest wins)
curl -X POST http://localhost:3001/update-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990098","name":"Boom Fixed","email":"boom@example.com"}'
# 5. confirm DONE + customer row (the poison row itself stays FAILED — history)
curl "http://localhost:3001/admin/ingests?status=DONE" -H "Authorization: Bearer $T"
curl "http://localhost:3001/admin/customers?q=EXT-990098" -H "Authorization: Bearer $T"`;

const CRON: Step[] = [
  { title: 'sweep-pending / 2 min', sub: 'Trigger now = by hand', tone: 'slate' },
  { title: 'PENDING > 60s', title2: 'FAILED < 10 · stale', sub: 'requeued to fast-lane', tone: 'blue' },
  { title: 'aggregate-stats 02:00', sub: 'counts + breakdown', tone: 'blue' },
  { title: 'Overview Latest stats', sub: 'Logs COMPLETED', tone: 'green' },
];

const RUN_CRON_A = `${TOKEN_NOTE}
# TEST A — aggregate-stats (auditor). Proof is on 3 pages, not in this response.
curl -X POST http://localhost:3001/admin/cron/aggregate-stats/trigger -H "Authorization: Bearer $T"
# → {"jobId":"..."} only. Now check:
#   Logs  → queue customer-cron + COMPLETED → aggregate-stats row, result =
#           {"customers":300000,"ingest":{"PENDING":..,"DONE":..},"prunedJobRuns":..}
#   Cron page → aggregate-stats row → last result column updates (reload page)
#   Overview  → Latest stats card updates with the same numbers`;

const RUN_CRON_B = `${TOKEN_NOTE}
# TEST B — sweep-pending (safety net). Healthy system returns enqueued: 0,
# so give it something to catch first: a poison row (FAILED, attempts 3 < 10).
curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990097","name":"__FAIL__sweep","email":"sweep@example.com"}'
# wait ~30s until Ingests shows it FAILED, then fire the sweeper by hand:
curl -X POST http://localhost:3001/admin/cron/sweep-pending/trigger -H "Authorization: Bearer $T"
# → {"jobId":"..."} only. Now check:
#   Logs  → customer-cron + COMPLETED → sweep-pending row, result = {"enqueued":1}
#   Ingests → FAILED row attempts climb 3 → 6 (requeued, failed again)
#   Queues  → fast-lane + waiting/active briefly shows the requeued job
#   Cron page → sweep-pending row → last result shows the fresh enqueued count`;

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

function Lane({ children }: { children: string }) {
  return <span className="lane">{children}</span>;
}

function Checks({ items }: { items: string[] }) {
  return (
    <>
      <h3>Where to check (dashboard :3000)</h3>
      <ol>
        {items.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ol>
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

      <h2>1. Happy path — create to DONE <Lane>FAST-LANE</Lane></h2>
      <p>The first drill every new operator runs. Everything here travels the fast lane.</p>
      <Diagram steps={HAPPY} edges={['accept', 'deliver', 'apply']} />
      <RunIt script={RUN_HAPPY} />
      <Checks
        items={[
          'Terminal: response shows ingestId, "ACCEPTED", delayMs. API console logs the accept line.',
          'Dashboard → Ingests → Status = PENDING → your EXT- row, attempts 0.',
          'Dashboard → Queues → lane fast-lane, state waiting (then active) → job ingest-<id>-0.',
          'Dashboard → Ingests → Status = DONE; Customers → search the ID; Logs → queue customer-fast-lane, COMPLETED.',
        ]}
      />

      <h2>2. Delayed demo — hold PENDING with FAST_LANE_DELAY_MS <Lane>FAST-LANE</Lane></h2>
      <p>Slow the system down so you can catch rows mid-flight on the inbox screen.</p>
      <Diagram steps={DELAYED} edges={['configure', 'enqueue', 'wait 20s']} />
      <RunIt script={RUN_DELAYED} />
      <Checks
        items={[
          'Terminal/.env: set FAST_LANE_DELAY_MS=20000, restart API (Ctrl+C, pnpm dev).',
          'Terminal: response shows "delayMs": 20000; API console logs delay=20s.',
          'Dashboard → Queues → lane fast-lane, state delayed → your job; Ingests → PENDING. Overview fast-lane card shows delayed: 1.',
          'Dashboard → Ingests → DONE; Overview delayed back to 0; Logs → COMPLETED run.',
        ]}
      />

      <h2>3. Failure and recovery — poison row drill <Lane>FAST-LANE</Lane></h2>
      <p>Requeue replays the same payload, so a poison name re-fails — the loop is the drill.
        Real recovery is a new ingest with fixed data. (The optional sweeper catch-up lives on the cron lane.)</p>
      <Diagram steps={FAILURE} edges={['inject', 'exhaust', 'replays → re-fails', 'resend fixed']} />
      <RunIt script={RUN_FAILURE} />
      <Checks
        items={[
          'Terminal: poison create accepted.',
          'Dashboard → Ingests → Status = FAILED → lastError "injected fault", attempts 3. Queues → lane fast-lane, state failed.',
          'Dashboard → Ingests → same row, attempts 6, still FAILED. Queues → failed again.',
          'Terminal: update-customer with the fixed name (new ingest).',
          'Dashboard → Customers → search ID shows fixed name; Ingests → DONE on the new row (poison row stays FAILED as history); Logs → COMPLETED.',
        ]}
      />

      <h2>4. Cron loops — sweeper and nightly stats <Lane>CRON</Lane></h2>
      <p>Verify the safety nets run on schedule and on demand. Everything here travels the cron lane.
        The trigger curl only answers <code>{'{"jobId":"…"}'}</code> — the proof is on the pages below.</p>
      <Diagram steps={CRON} edges={['schedule', 'catch up', 'count']} />
      <h3>Test A — aggregate-stats (auditor)</h3>
      <RunIt script={RUN_CRON_A} />
      <h3>Test B — sweep-pending (safety net)</h3>
      <RunIt script={RUN_CRON_B} />
      <Checks
        items={[
          'Test A trigger: terminal (or dashboard → Cron → Trigger now on aggregate-stats).',
          'Test A proof: Logs → queue customer-cron, COMPLETED → aggregate-stats row with counts JSON; Overview → Latest stats updates; Cron page → last result updates (reload).',
          'Test B setup: poison create → Ingests → FAILED, attempts 3; then trigger (terminal or Cron → Trigger now on sweep-pending).',
          'Test B proof: Logs → sweep-pending row result {"enqueued":1}; Ingests → FAILED attempts 3 → 6; Queues → fast-lane waiting/active (brief); Cron page → fresh enqueued count.',
        ]}
      />
    </>
  );
}
