export default function TroubleshootingDocs() {
  return (
    <>
      <h1>Troubleshooting — when something looks wrong</h1>
      <table>
        <thead>
          <tr><th>Symptom</th><th>Meaning</th><th>What to do</th></tr>
        </thead>
        <tbody>
          <tr><td>PENDING rows growing</td><td>Worker stopped or Redis down</td><td>Start the worker / Redis; trigger sweep-pending from Cron to hurry it.</td></tr>
          <tr><td>FAILED rows</td><td>Payload or system fault</td><td>Read lastError on Ingests; fix the cause; Requeue.</td></tr>
          <tr><td>Queue cards say unavailable</td><td>Redis unreachable</td><td>Ingest API still accepts; inbox pages keep working; restart Redis, then trigger the sweeper.</td></tr>
          <tr><td>Retry says not found</td><td>Job aged out of Redis</td><td>Requeue the inbox row from Ingests instead.</td></tr>
          <tr><td>Same customer updated twice, older data showing</td><td>Race (known limitation)</td><td>Re-send the newer update; newest write wins on reprocessing.</td></tr>
        </tbody>
      </table>
      <h2>Demo data and keys (training only)</h2>
      <ul>
        <li>API key header: x-api-key: dev-key-1. Admin dashboard calls use a server-side token — you never type it.</li>
        <li>Seeded customers: EXT-000001 … EXT-300000.</li>
        <li>Poison name for failure drills: any name starting with __FAIL__.</li>
      </ul>
    </>
  );
}
