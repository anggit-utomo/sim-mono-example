export default function QueuesDocs() {
  return (
    <>
      <h1>Queues — the waiting lines</h1>
      <p>
        What it is: the waiting lines, both lanes. Pick a lane (fast-lane or cron) and a job state
        (waiting, active, delayed, completed, failed) and page through the jobs. Each row shows the
        job id, name, how many attempts it took, and — for failed jobs — the failure reason.
      </p>
      <h2>How to use it</h2>
      <p>
        When the Overview shows failed jobs, select fast-lane + failed, read the failedReason, fix
        the underlying cause, then press Retry on the job. Retry only works while the job is still
        stored; if it says not found, the job aged out and you should requeue the inbox row from
        Ingests instead.
      </p>
      <h2>How to test it</h2>
      <p>
        Create a customer with name __FAIL__boom through the API (a deliberate poison used for
        training). Within ~10 seconds it appears under failed with reason injected fault. Press
        Retry → it runs again and fails again, proving retries execute.
      </p>
      <span className="mock-label">Example view — not live data</span>
      <div className="toolbar">
        <select disabled><option>fast-lane</option><option>cron</option></select>
        <select disabled><option>failed</option><option>waiting</option><option>completed</option></select>
        <button disabled>Retry</button>
      </div>
      <table>
        <thead>
          <tr><th>job id</th><th>name</th><th>attempts</th><th>failedReason</th></tr>
        </thead>
        <tbody>
          <tr><td>job-101</td><td>process-ingest</td><td>3</td><td>injected fault</td></tr>
          <tr><td>job-102</td><td>process-ingest</td><td>1</td><td></td></tr>
        </tbody>
      </table>
    </>
  );
}
