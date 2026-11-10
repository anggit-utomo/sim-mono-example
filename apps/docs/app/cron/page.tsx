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
      <h2>Same from the terminal</h2>
      <p>
        Your curl calls hit the fast lane, not cron. Fire a cron job by hand with the admin token
        (ADMIN_TOKEN from .env):
      </p>
      <pre>{`curl -X POST http://localhost:3001/admin/cron/aggregate-stats/trigger \\
  -H "Authorization: Bearer <ADMIN_TOKEN>"
# → Logs (customer-cron + COMPLETED) gains a row; Overview Latest stats updates.`}</pre>
      <p>
        To see sweep-pending catch something, first create a poison row (it fails and ends
        FAILED), then trigger the sweeper (~30s later):
      </p>
      <pre>{`curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990098","name":"__FAIL__boom","email":"boom@example.com"}'
# wait ~30s, then:
curl -X POST http://localhost:3001/admin/cron/sweep-pending/trigger \\
  -H "Authorization: Bearer <ADMIN_TOKEN>"
# → COMPLETED sweep-pending run in Logs; FAILED row attempts climb in Ingests.`}</pre>
      <p>
        The sweeper picks up PENDING rows older than 60s, FAILED rows with fewer than 10
        attempts, and PROCESSING rows stale for over 10 minutes.
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
