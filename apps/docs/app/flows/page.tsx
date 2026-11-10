export default function FlowsDocs() {
  return (
    <>
      <h1>Flows — system graphs for testing scenarios</h1>
      <p>
        Four end-to-end paths through the system. Each box is a step you can watch on the
        dashboard pages named under it. All graphs are static — run the steps yourself to see
        them live.
      </p>

      <h2>1. Happy path — create to DONE</h2>
      <p>Use it: the first drill every new operator runs.</p>
      <div className="flow">
        <div className="fnode">POST /create-customer<div className="fsub">curl or Postman</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">ACCEPTED + inbox row PENDING<div className="fsub">Ingests → PENDING</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">fast-lane job process-ingest<div className="fsub">Queues → fast-lane → waiting/active</div></div>
        <div className="farrow">↓</div>
        <div className="fnode ok">Row DONE, customer visible<div className="fsub">Ingests → DONE · Customers search · Logs COMPLETED</div></div>
      </div>

      <h2>2. Delayed demo — hold PENDING with FAST_LANE_DELAY_MS</h2>
      <p>Use it: slow the system down so you can catch rows mid-flight on the inbox screen.</p>
      <div className="flow">
        <div className="fnode">.env: FAST_LANE_DELAY_MS=20000<div className="fsub">restart API</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">POST /create-customer → delayMs: 20000<div className="fsub">terminal + API console log</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">Job parked in delayed set for 20s<div className="fsub">Queues → fast-lane → delayed · Ingests → PENDING</div></div>
        <div className="farrow">↓</div>
        <div className="fnode ok">Timer fires → normal delivery → DONE<div className="fsub">Ingests → DONE · Logs COMPLETED</div></div>
      </div>

      <h2>3. Failure and recovery — poison row drill</h2>
      <p>Use it: practice the main recovery loop — find the error, fix the cause, requeue.</p>
      <div className="flow">
        <div className="fnode">POST name __FAIL__boom<div className="fsub">training poison</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">Worker throws injected fault<div className="fsub">Ingests → PROCESSING, attempts climb</div></div>
        <div className="farrow">↓</div>
        <div className="fnode error">3 attempts exhausted → FAILED<div className="fsub">Ingests → FAILED + lastError · Queues → failed</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">Fix cause → Requeue (or sweep-pending catches it)<div className="fsub">Ingests → Requeue · Cron → Trigger now</div></div>
        <div className="farrow">↓</div>
        <div className="fnode ok">Redelivered → DONE<div className="fsub">Logs shows the retry COMPLETED run</div></div>
      </div>

      <h2>4. Cron loops — sweeper and nightly stats</h2>
      <p>Use it: verify the safety nets run on schedule and on demand.</p>
      <div className="flow">
        <div className="fnode">sweep-pending every 2 min<div className="fsub">Cron → Trigger now to run it by hand</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">Picks up PENDING &gt; 60s · FAILED &lt; 10 attempts · PROCESSING stale &gt; 10 min<div className="fsub">requeues into fast-lane</div></div>
        <div className="farrow">↓</div>
        <div className="fnode">aggregate-stats nightly 02:00<div className="fsub">counts customers + inbox breakdown</div></div>
        <div className="farrow">↓</div>
        <div className="fnode ok">Result stored as job run → Overview Latest stats<div className="fsub">Logs → customer-cron → COMPLETED</div></div>
      </div>
    </>
  );
}
