import Diagram, { Legend, type Step } from './diagram';

const HAPPY: Step[] = [
  { title: 'POST /create-customer', sub: 'curl · Postman', tone: 'slate' },
  { title: 'ACCEPTED · PENDING', sub: 'Ingests → PENDING', sub2: 'delayMs in response', tone: 'amber' },
  { title: 'process-ingest runs', sub: 'Queues → waiting/active', tone: 'blue' },
  { title: 'DONE · customer live', sub: 'Customers search', sub2: 'Logs COMPLETED', tone: 'green' },
];

const DELAYED: Step[] = [
  { title: 'FAST_LANE_DELAY_MS', title2: '= 20000 in .env', sub: 'restart API', tone: 'slate' },
  { title: 'ACCEPTED · delay 20s', sub: 'terminal + API log', tone: 'amber' },
  { title: 'parked in delayed set', sub: 'Queues → delayed', sub2: 'Ingests → PENDING', tone: 'amber' },
  { title: 'timer fires → DONE', sub: 'normal delivery', tone: 'green' },
];

const FAILURE: Step[] = [
  { title: 'POST __FAIL__boom', sub: 'training poison', tone: 'slate' },
  { title: 'worker throws', sub: 'attempts climb', sub2: 'exponential backoff', tone: 'blue' },
  { title: 'FAILED after 3 tries', sub: 'lastError on row', sub2: 'Queues → failed', tone: 'red' },
  { title: 'fix + Requeue', sub: 'or sweep-pending', tone: 'amber' },
  { title: 'redelivered → DONE', sub: 'Logs COMPLETED', tone: 'green' },
];

const CRON: Step[] = [
  { title: 'sweep-pending / 2 min', sub: 'Trigger now = by hand', tone: 'slate' },
  { title: 'PENDING > 60s', title2: 'FAILED < 10 · stale', sub: 'requeued to fast-lane', tone: 'blue' },
  { title: 'aggregate-stats 02:00', sub: 'counts + breakdown', tone: 'blue' },
  { title: 'Overview Latest stats', sub: 'Logs COMPLETED', tone: 'green' },
];

export default function FlowsDocs() {
  return (
    <>
      <h1>Flows — system graphs for testing scenarios</h1>
      <p>
        Four end-to-end paths through the system. Run the steps yourself to see them live on the
        dashboard pages named under each node.
      </p>
      <Legend />

      <h2>1. Happy path — create to DONE</h2>
      <p>The first drill every new operator runs.</p>
      <Diagram steps={HAPPY} edges={['accept', 'deliver', 'apply']} />

      <h2>2. Delayed demo — hold PENDING with FAST_LANE_DELAY_MS</h2>
      <p>Slow the system down so you can catch rows mid-flight on the inbox screen.</p>
      <Diagram steps={DELAYED} edges={['configure', 'enqueue', 'wait 20s']} />

      <h2>3. Failure and recovery — poison row drill</h2>
      <p>Practice the main recovery loop: find the error, fix the cause, requeue.</p>
      <Diagram steps={FAILURE} edges={['inject', 'retry ×3', 'recover', 'verify']} />

      <h2>4. Cron loops — sweeper and nightly stats</h2>
      <p>Verify the safety nets run on schedule and on demand.</p>
      <Diagram steps={CRON} edges={['schedule', 'catch up', 'count']} />
    </>
  );
}
