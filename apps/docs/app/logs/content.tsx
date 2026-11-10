import { t, type Locale } from '../i18n';

export default function LogsContent({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{t(locale, 'lo_h1')}</h1>
      <p>{t(locale, 'lo_what')}</p>
      <h2>{t(locale, 'lo_test_h')}</h2>
      <p>{t(locale, 'lo_test')}</p>
      <span className="mock-label">{t(locale, 'mock')}</span>
      <div className="toolbar">
        <select disabled><option>customer-fast-lane</option><option>customer-cron</option></select>
        <select disabled><option>COMPLETED</option><option>FAILED</option></select>
      </div>
      <table>
        <thead>
          <tr><th>queue</th><th>job</th><th>status</th><th>attempts</th><th>duration</th><th>error</th></tr>
        </thead>
        <tbody>
          <tr><td>customer-fast-lane</td><td>process-ingest</td><td>COMPLETED</td><td>1</td><td>120ms</td><td></td></tr>
          <tr><td>customer-fast-lane</td><td>process-ingest</td><td>FAILED</td><td>3</td><td>90ms</td><td>injected fault</td></tr>
        </tbody>
      </table>
    </>
  );
}
