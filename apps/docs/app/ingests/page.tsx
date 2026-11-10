export default function IngestsDocs() {
  return (
    <>
      <h1>Ingests — the inbox</h1>
      <p>
        What it is: the inbox — every accepted request and its status. Filter by status. Each row
        shows the customer ID, whether it was a CREATE or UPDATE, the attempt count, and the error
        text when it failed.
      </p>
      <h2>How to use it (main recovery tool)</h2>
      <ul>
        <li>One stuck row → Requeue sends it back to the fast lane.</li>
        <li>Many failed rows → Requeue all failed sends every recoverable FAILED row back at once.</li>
        <li>Requeueing a DONE row is safe: the worker sees it is already done and skips it.</li>
      </ul>
      <h2>How to test it</h2>
      <p>
        Filter FAILED → find the __FAIL__boom row with its error text. Press Requeue → it runs
        again (and fails again until the cause is fixed, which is the point: the loop is visible
        and controllable). This page keeps working even when Redis is down.
      </p>
      <span className="mock-label">Example view — not live data</span>
      <div className="toolbar">
        <select disabled><option>FAILED</option><option>PENDING</option><option>DONE</option></select>
        <button disabled>Requeue all failed</button>
      </div>
      <table>
        <thead>
          <tr><th>customer</th><th>kind</th><th>status</th><th>attempts</th><th>lastError</th><th></th></tr>
        </thead>
        <tbody>
          <tr><td>EXT-990001</td><td>CREATE</td><td>FAILED</td><td>3</td><td>injected fault</td><td><button disabled>Requeue</button></td></tr>
          <tr><td>EXT-990002</td><td>UPDATE</td><td>DONE</td><td>1</td><td></td><td><button disabled>Requeue</button></td></tr>
        </tbody>
      </table>
    </>
  );
}
