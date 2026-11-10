'use client';

import Diagram, { Legend } from '../flows/diagram';
import FlowChart from '../architecture/detail';
import { DELIVERY, ACCEPT, PROCESS, SWEEP, STATS, ADMIN, INVENTORY } from '../architecture/data';
import { useT, useTa,  } from '../locale-hooks';

export default function ArchitectureContent() {
  return (
    <>
      <h1>{useT( 'ar_h1')}</h1>
      <span className="mock-label">{useT('mock')}</span>
      <p>
        {useT('ar_intro')} <a href="/flows">{useT('ar_intro_link')}</a>{' '}
        {useT( 'ar_intro_end')}
      </p>
      <Legend />

      <h2>{useT( 'ar_map_h')}</h2>
      <Diagram steps={DELIVERY} edges={['POST', 'enqueue', 'consume', 'upsert']} />

      <h2>{useT( 'ar_s1_h')} <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={ACCEPT} />

      <h2>{useT( 'ar_s2_h')} <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={PROCESS} />

      <h2>{useT( 'ar_s3_h')} <span className="lane">CRON</span></h2>
      <FlowChart nodes={SWEEP} />

      <h2>{useT( 'ar_s4_h')} <span className="lane">CRON</span></h2>
      <FlowChart nodes={STATS} />

      <h2>{useT( 'ar_ctrl_h')}</h2>
      <table>
        <thead>
          <tr>
            {useTa( 'ar_ctrl_th').map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ADMIN.map(([e, f, q]) => (
            <tr key={e}>
              <td>{e}</td><td>{f}</td><td>{q}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>{useT( 'ar_inv_h')}</h2>
      <table>
        <thead>
          <tr>
            {useTa( 'ar_inv_th').map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INVENTORY.map(([s, tt, p, r]) => (
            <tr key={s}>
              <td>{s}</td><td>{tt}</td><td>{p}</td><td>{r}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
