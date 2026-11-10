'use client';

import CopyButton from '../copy-button';
import { CURL } from './script';
import { useT, useTa,  } from '../locale-hooks';

export default function WalkthroughContent() {
  return (
    <>
      <h1>{useT( 'wt_h1')}</h1>
      <ol>
        {useTa( 'wt_steps').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <span className="mock-label">{useT( 'mock')}</span>
      <pre>{JSON.stringify({ externalId: 'EXT-990001', name: 'Ada', email: 'ada@example.com' }, null, 2)}</pre>
      <h2>{useT( 'wt_try_h')}</h2>
      <p>
        {useT( 'wt_tip_1')} <code>FAST_LANE_DELAY_MS=20000</code> {useT( 'wt_tip_2')}{' '}
        <code>.env</code> {useT( 'wt_tip_3')} <code>0</code> {useT( 'wt_tip_4')}
      </p>
      <div className="toolbar">
        <CopyButton text={CURL} />
      </div>
      <pre>{CURL}</pre>
      <p>{useT( 'wt_resp')}</p>
      <pre>{JSON.stringify({ ingestId: '…', status: 'ACCEPTED', delayMs: 20000 }, null, 2)}</pre>
    </>
  );
}
