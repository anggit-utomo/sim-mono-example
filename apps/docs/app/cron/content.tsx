'use client';

import { useT,  } from '../locale-hooks';

export default function CronContent() {
  return (
    <>
      <h1>{useT( 'cr_h1')}</h1>
      <p>{useT( 'cr_what')}</p>
      <h2>{useT( 'cr_use_h')}</h2>
      <p>{useT( 'cr_use')}</p>
      <h2>{useT( 'cr_test_h')}</h2>
      <p>{useT( 'cr_test')}</p>
      <span className="mock-label">{useT( 'mock')}</span>
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
