'use client';

import { useT, useTa,  } from '../locale-hooks';

export default function IngestsContent() {
  return (
    <>
      <h1>{useT( 'in_h1')}</h1>
      <p>{useT( 'in_what')}</p>
      <h2>{useT( 'in_use_h')}</h2>
      <ul>
        {useTa( 'in_use').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <h2>{useT( 'in_test_h')}</h2>
      <p>{useT( 'in_test')}</p>
      <span className="mock-label">{useT( 'mock')}</span>
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
