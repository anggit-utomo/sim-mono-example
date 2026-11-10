export default function LogsDocs() {
  return (
    <>
      <h1>Logs — the history</h1>
      <p>
        What it is: the history of everything workers did — which queue, which job, COMPLETED or
        FAILED, attempts used, duration, error, and finish time. Filter by queue and status.
        Read-only: nothing here can be clicked to change anything, which makes it safe for
        auditing.
      </p>
      <h2>How to test it</h2>
      <p>
        Trigger a cron job, requeue a row, or retry a job, then filter Logs — a matching row
        appears within seconds. Filter customer-fast-lane + FAILED to see every failed delivery
        attempt.
      </p>
      <span className="mock-label">Example view — not live data</span>
      <div className="toolbar">
        <select disabled><option>customer-fast-lane</option><option>customer-cron</option></select>
        <select disabled><option>COMPLETED</option><option>FAILED</option></select>
      </div>
      <table>
        <thead>
          <tr><th>queue</th><th>job</th><th>status</th><th>attempts</th><th>duration</th><th>error</th></tr>
        </thead>
        <tbody>
          <tr><td>customer-fast-lane</td><td>process-ingest</td><td>COMPLETED</td><td>1</td><td>120ms</td><td></td></tr>
          <tr><td>customer-fast-lane</td><td>process-ingest</td><td>FAILED</td><td>3</td><td>90ms</td><td>injected fault</td></tr>
        </tbody>
      </table>
    </>
  );
}
