import Diagram, { Legend } from './diagram';
import {
  HAPPY, RUN_HAPPY, DELAYED, RUN_DELAYED, FAILURE, RUN_FAILURE,
  CRON, RUN_CRON_A, RUN_CRON_B,
} from './scripts';
import { RunIt, Lane, Checks } from './parts';

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
