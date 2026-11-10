import Diagram, { Legend } from '../flows/diagram';
import FlowChart from '../architecture/detail';
import { DELIVERY, ACCEPT, PROCESS, SWEEP, STATS, ADMIN, INVENTORY } from '../architecture/data';
import { t, ta, type Locale } from '../i18n';

export default function ArchitectureContent({ locale }: { locale: Locale }) {
  const home = locale === 'id' ? '/id' : '';
  return (
    <>
      <h1>{t(locale, 'ar_h1')}</h1>
      <p>
        {t(locale, 'ar_intro')} <a href={`${home}/flows`}>{t(locale, 'ar_intro_link')}</a>{' '}
        {t(locale, 'ar_intro_end')}
      </p>
      <Legend />

      <h2>{t(locale, 'ar_map_h')}</h2>
      <Diagram steps={DELIVERY} edges={['POST', 'enqueue', 'consume', 'upsert']} />

      <h2>{t(locale, 'ar_s1_h')} <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={ACCEPT} />

      <h2>{t(locale, 'ar_s2_h')} <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={PROCESS} />

      <h2>{t(locale, 'ar_s3_h')} <span className="lane">CRON</span></h2>
      <FlowChart nodes={SWEEP} />

      <h2>{t(locale, 'ar_s4_h')} <span className="lane">CRON</span></h2>
      <FlowChart nodes={STATS} />

      <h2>{t(locale, 'ar_ctrl_h')}</h2>
      <table>
        <thead>
          <tr>
            {ta(locale, 'ar_ctrl_th').map((h, i) => (
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

      <h2>{t(locale, 'ar_inv_h')}</h2>
      <table>
        <thead>
          <tr>
            {ta(locale, 'ar_inv_th').map((h, i) => (
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
