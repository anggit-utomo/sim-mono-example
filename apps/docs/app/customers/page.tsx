export default function CustomersDocs() {
  return (
    <>
      <h1>Customers — the customer table</h1>
      <p>
        What it is: the truth the whole system maintains. Seeded with 300,000 demo rows
        (EXT-000001 …). 50 rows per page so it stays fast.
      </p>
      <h2>How to use it</h2>
      <p>
        Type an exact customer ID (for example EXT-000001) or the start of an email (for example
        eloise) and press Search. Flip pages with Prev/Next.
      </p>
      <h2>How to test it</h2>
      <ul>
        <li>Search EXT-000001 → exactly 1 row.</li>
        <li>Search a short email prefix → a list.</li>
        <li>Open page 2 → 50 different rows.</li>
      </ul>
      <span className="mock-label">Example view — not live data</span>
      <div className="toolbar">
        <input placeholder="EXT-000001 or email prefix" disabled />
        <button disabled>Search</button>
        <button disabled>Prev</button>
        <button disabled>Next</button>
      </div>
      <table>
        <thead>
          <tr><th>externalId</th><th>name</th><th>email</th></tr>
        </thead>
        <tbody>
          <tr><td>EXT-000001</td><td>Ada</td><td>ada@example.com</td></tr>
          <tr><td>EXT-000002</td><td>Bo</td><td>bo@example.com</td></tr>
        </tbody>
      </table>
    </>
  );
}
