'use client';

import { useT, useTa, useTm,  } from '../locale-hooks';

export default function TroubleshootingContent() {
  return (
    <>
      <h1>{useT( 'ts_h1')}</h1>
      <span className="mock-label">{useT('mock')}</span>
      <table>
        <thead>
          <tr>
            {useTa( 'ts_th').map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {useTm( 'ts_rows').map((row, i) => (
            <tr key={i}>
              {row.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h2>{useT( 'ts_demo_h')}</h2>
      <ul>
        {useTa( 'ts_demo').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </>
  );
}
