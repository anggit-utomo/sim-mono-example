'use client';

import { useT, useTa,  } from '../locale-hooks';

export default function CustomersContent() {
  return (
    <>
      <h1>{useT( 'cu_h1')}</h1>
      <p>{useT( 'cu_what')}</p>
      <h2>{useT( 'cu_use_h')}</h2>
      <p>{useT( 'cu_use')}</p>
      <h2>{useT( 'cu_test_h')}</h2>
      <ul>
        {useTa( 'cu_test').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <span className="mock-label">{useT( 'mock')}</span>
      <div className="toolbar">
        <input placeholder={useT( 'cu_ph')} disabled />
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
