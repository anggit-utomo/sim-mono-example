'use client';

import { useT,  } from '../locale-hooks';

export default function QueuesContent() {
  return (
    <>
      <h1>{useT( 'qu_h1')}</h1>
      <p>{useT( 'qu_what')}</p>
      <h2>{useT( 'qu_use_h')}</h2>
      <p>{useT( 'qu_use')}</p>
      <h2>{useT( 'qu_test_h')}</h2>
      <p>{useT( 'qu_test')}</p>
      <span className="mock-label">{useT( 'mock')}</span>
      <div className="toolbar">
        <select disabled><option>fast-lane</option><option>cron</option></select>
        <select disabled><option>failed</option><option>waiting</option><option>completed</option></select>
        <button disabled>Retry</button>
      </div>
      <table>
        <thead>
          <tr><th>job id</th><th>name</th><th>attempts</th><th>failedReason</th></tr>
        </thead>
        <tbody>
          <tr><td>job-101</td><td>process-ingest</td><td>3</td><td>injected fault</td></tr>
          <tr><td>job-102</td><td>process-ingest</td><td>1</td><td></td></tr>
        </tbody>
      </table>
    </>
  );
}
