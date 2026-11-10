import { t, ta, type Locale } from '../i18n';

export default function CustomersContent({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{t(locale, 'cu_h1')}</h1>
      <p>{t(locale, 'cu_what')}</p>
      <h2>{t(locale, 'cu_use_h')}</h2>
      <p>{t(locale, 'cu_use')}</p>
      <h2>{t(locale, 'cu_test_h')}</h2>
      <ul>
        {ta(locale, 'cu_test').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <span className="mock-label">{t(locale, 'mock')}</span>
      <div className="toolbar">
        <input placeholder={t(locale, 'cu_ph')} disabled />
        <button disabled>Search</button>
        <button disabled>Prev</button>
        <button disabled>Next</button>
      </div>
      <table>
        <thead>
          <tr><th>externalId</th><th>name</th><th>email</th></tr>
        </thead>
        <tbody>
          <tr><td>EXT-000001</td><td>Ada</td><td>ada@example.com</td></tr>
          <tr><td>EXT-000002</td><td>Bo</td><td>bo@example.com</td></tr>
        </tbody>
      </table>
    </>
  );
}
