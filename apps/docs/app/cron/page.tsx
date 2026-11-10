export default function CronDocs() {
  return (
    <>
      <h1>Cron — the schedules</h1>
      <p>
        What it is: the two schedules — sweep-pending (every 2 minutes) and aggregate-stats
        (nightly 02:00) — with their pattern, timezone, and the result of their last run.
      </p>
      <h2>How to use it</h2>
      <p>
        Press Trigger now (you get a confirmation dialog) to run a schedule immediately instead of
        waiting. Use it after an outage: trigger sweep-pending and watch PENDING rows get picked
        up. Do not trigger repeatedly — one run is enough; duplicates are harmless but noisy.
      </p>
      <h2>How to test it</h2>
      <p>
        Press Trigger now on aggregate-stats, confirm, wait a few seconds, reload: its last result
        updates with fresh customer totals, and a new COMPLETED row appears on the Logs page.
      </p>
      <span className="mock-label">Example view — not live data</span>
      <table>
        <thead>
          <tr><th>job</th><th>pattern</th><th>timezone</th><th>last result</th><th></th></tr>
        </thead>
        <tbody>
          <tr><td>sweep-pending</td><td>every 2 minutes</td><td>UTC</td><td>requeued 2</td><td><button disabled>Trigger now</button></td></tr>
          <tr><td>aggregate-stats</td><td>02:00 nightly</td><td>UTC</td><td>customers 300000</td><td><button disabled>Trigger now</button></td></tr>
        </tbody>
      </table>
    </>
  );
}
