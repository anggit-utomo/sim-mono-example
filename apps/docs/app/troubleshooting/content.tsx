import { t, ta, tm, type Locale } from '../i18n';

export default function TroubleshootingContent({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{t(locale, 'ts_h1')}</h1>
      <table>
        <thead>
          <tr>
            {ta(locale, 'ts_th').map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tm(locale, 'ts_rows').map((row, i) => (
            <tr key={i}>
              {row.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h2>{t(locale, 'ts_demo_h')}</h2>
      <ul>
        {ta(locale, 'ts_demo').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </>
  );
}
