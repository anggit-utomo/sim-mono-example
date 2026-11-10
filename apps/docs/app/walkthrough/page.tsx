import CopyButton from './copy-button';

const CURL = `curl -X POST http://localhost:3001/create-customer \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: dev-key-1" \\
  -d '{"externalId":"EXT-990001","name":"Ada","email":"ada@example.com"}'`;

export default function WalkthroughDocs() {
  return (
    <>
      <h1>Walkthrough — the happy path</h1>
      <ol>
        <li>
          Send a customer through the API (replace the ID to repeat): POST /create-customer with
          externalId EXT-990001, name Ada, email ada@example.com and header x-api-key dev-key-1.
          You get an ingestId and status ACCEPTED.
        </li>
        <li>Open Ingests, filter PENDING — your row appears, then flips to DONE within a second.</li>
        <li>Open Customers, search EXT-990001 — Ada is there.</li>
        <li>Send an update for the same ID with a new name. Customers shows one row with the new name — newest wins.</li>
        <li>Open Logs — one COMPLETED run for your ingest.</li>
      </ol>
      <span className="mock-label">Example view — not live data</span>
      <pre>{JSON.stringify({ externalId: 'EXT-990001', name: 'Ada', email: 'ada@example.com' }, null, 2)}</pre>
      <h2>Try it — copy-paste curl</h2>
      <p>
        Training tip: set <code>FAST_LANE_DELAY_MS=20000</code> in <code>.env</code> and restart the
        API to hold new rows in PENDING for 20 seconds, so you can catch them on the Ingests page.
        Default <code>0</code> delivers immediately.
      </p>
      <div className="toolbar">
        <CopyButton text={CURL} />
      </div>
      <pre>{CURL}</pre>
    </>
  );
}
