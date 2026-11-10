import { t, ta, tm, tp, type Locale } from './i18n';

export default function OverviewContent({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{t(locale, 'ov_h1')}</h1>
      <p>{t(locale, 'ov_intro')}</p>
      <h2>{t(locale, 'ov_flow_h')}</h2>
      <ol>
        {ta(locale, 'ov_flow').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <h2>{t(locale, 'ov_guar_h')}</h2>
      <ul>
        {tp(locale, 'ov_guar').map((g, i) => (
          <li key={i}>
            <strong>{g.b}</strong> {g.t}
          </li>
        ))}
      </ul>
      <h2>{t(locale, 'ov_words_h')}</h2>
      <table>
        <thead>
          <tr>
            {ta(locale, 'ov_th').map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tm(locale, 'ov_words').map((row, i) => (
            <tr key={i}>
              {row.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{t(locale, 'ov_run_h')}</h2>
      <p>
        <code>pnpm dev</code> {t(locale, 'ov_run_1')} <code>3000</code>
        {t(locale, 'ov_run_2')} <code>3001</code>
        {t(locale, 'ov_run_3')} <code>3002</code>
        {t(locale, 'ov_run_4')}
      </p>
      <h2>{t(locale, 'ov_health_h')}</h2>
      <p>{t(locale, 'ov_health')}</p>
      <span className="mock-label">{t(locale, 'mock')}</span>
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
