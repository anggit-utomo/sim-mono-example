'use client';

import { useT, useTa, useTm, useTp,  } from './locale-hooks';

export default function OverviewContent() {
  return (
    <>
      <h1>{useT( 'ov_h1')}</h1>
      <p>{useT( 'ov_intro')}</p>
      <h2>{useT( 'ov_flow_h')}</h2>
      <ol>
        {useTa( 'ov_flow').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <h2>{useT( 'ov_guar_h')}</h2>
      <ul>
        {useTp( 'ov_guar').map((g, i) => (
          <li key={i}>
            <strong>{g.b}</strong> {g.t}
          </li>
        ))}
      </ul>
      <h2>{useT( 'ov_words_h')}</h2>
      <table>
        <thead>
          <tr>
            {useTa( 'ov_th').map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {useTm( 'ov_words').map((row, i) => (
            <tr key={i}>
              {row.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{useT( 'ov_run_h')}</h2>
      <p>
        <code>pnpm dev</code> {useT( 'ov_run_1')} <code>3000</code>
        {useT( 'ov_run_2')} <code>3001</code>
        {useT( 'ov_run_3')} <code>3002</code>
        {useT( 'ov_run_4')}
      </p>
      <h2>{useT( 'ov_health_h')}</h2>
      <p>{useT( 'ov_health')}</p>
      <span className="mock-label">{useT( 'mock')}</span>
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
