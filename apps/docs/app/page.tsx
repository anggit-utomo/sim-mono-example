export default function OverviewDocs() {
  return (
    <>
      <h1>Overview — what is this system?</h1>
      <p>
        Outside companies send us customer records (an ID, a name, an email). This system receives
        those records, saves them into our customer table, and gives operators screens to watch the
        work happen and fix anything that gets stuck.
      </p>
      <h2>Post-office flow</h2>
      <ol>
        <li>A sender drops a letter in the mailbox — a third party calls our API.</li>
        <li>
          The clerk stamps it received — the API stores an ingest record and answers accepted
          within a fraction of a second. The sender never waits for delivery.
        </li>
        <li>
          A courier delivers it immediately — the fast-lane worker writes the customer into the
          customer table, usually in under a second.
        </li>
        <li>
          Every 2 minutes a supervisor checks for letters nobody picked up — the sweeper re-queues
          anything the courier missed.
        </li>
        <li>
          Once a night an auditor counts everything — aggregate-stats records totals for the
          Overview page.
        </li>
      </ol>
      <h2>Guarantees</h2>
      <ul>
        <li>
          <strong>Nothing is lost.</strong> Every accepted request is stored first. Every accepted
          request ends as DONE or FAILED — never silently dropped.
        </li>
        <li>
          <strong>Newest wins.</strong> If two updates for the same customer race, the newer request
          wins and the older one is skipped as stale.
        </li>
      </ul>
      <h2>Words used in this guide</h2>
      <table>
        <thead>
          <tr>
            <th>Word</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Customer</td><td>The current truth: one row per externalId with name and email.</td></tr>
          <tr><td>Ingest (inbox row)</td><td>One accepted request, with a status: PENDING, PROCESSING, DONE, FAILED.</td></tr>
          <tr><td>Queue</td><td>A waiting line of jobs. customer-fast-lane = deliver now, customer-cron = scheduled work.</td></tr>
          <tr><td>Job</td><td>One unit of work in a queue (for example: process one ingest row).</td></tr>
          <tr><td>Cron</td><td>Work on a schedule: the 2-minute sweeper and the nightly stats.</td></tr>
          <tr><td>Job run (log)</td><td>A history entry saying a job finished or failed, with how long it took.</td></tr>
        </tbody>
      </table>

      <h2>Running locally</h2>
      <p>
        <code>pnpm dev</code> starts everything. Fixed ports: dashboard on <code>3000</code>,
        API on <code>3001</code>, this docs app on <code>3002</code>.
      </p>
      <h2>Health screen</h2>
      <p>
        Open the real Overview first whenever something feels wrong. If PENDING or FAILED is
        growing, go to Ingests. If failed jobs are growing, go to Queues. If a card says
        unavailable (Redis down?), the queue system is unreachable — the inbox cards still work.
      </p>
      <span className="mock-label">Example view — not live data</span>
      <div className="cards">
        <div className="card">
          <h3>Fast lane</h3>
          <p>waiting: <strong>2</strong> active: <strong>0</strong> delayed: <strong>0</strong> completed: <strong>120</strong> failed: <strong>1</strong></p>
        </div>
        <div className="card">
          <h3>Cron</h3>
          <p>waiting: <strong>0</strong> active: <strong>0</strong> delayed: <strong>2</strong> completed: <strong>48</strong> failed: <strong>0</strong></p>
        </div>
        <div className="card">
          <h3>Inbox</h3>
          <p>PENDING: <strong>2</strong> PROCESSING: <strong>0</strong> DONE: <strong>118</strong> FAILED: <strong>1</strong></p>
        </div>
        <div className="card">
          <h3>Latest stats</h3>
          <pre>{JSON.stringify({ customers: 300000, pending: 2, failed: 1 }, null, 2)}</pre>
        </div>
      </div>
    </>
  );
}
