import CopyButton from '../copy-button';
import { CURL } from './script';
import { t, ta, type Locale } from '../i18n';

export default function WalkthroughContent({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{t(locale, 'wt_h1')}</h1>
      <ol>
        {ta(locale, 'wt_steps').map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      <span className="mock-label">{t(locale, 'mock')}</span>
      <pre>{JSON.stringify({ externalId: 'EXT-990001', name: 'Ada', email: 'ada@example.com' }, null, 2)}</pre>
      <h2>{t(locale, 'wt_try_h')}</h2>
      <p>
        {t(locale, 'wt_tip_1')} <code>FAST_LANE_DELAY_MS=20000</code> {t(locale, 'wt_tip_2')}{' '}
        <code>.env</code> {t(locale, 'wt_tip_3')} <code>0</code> {t(locale, 'wt_tip_4')}
      </p>
      <div className="toolbar">
        <CopyButton text={CURL} />
      </div>
      <pre>{CURL}</pre>
      <p>{t(locale, 'wt_resp')}</p>
      <pre>{JSON.stringify({ ingestId: '…', status: 'ACCEPTED', delayMs: 20000 }, null, 2)}</pre>
    </>
  );
}
