import Diagram, { Legend } from './diagram';
import {
  HAPPY, RUN_HAPPY, DELAYED, RUN_DELAYED, FAILURE, RUN_FAILURE,
  CRON, RUN_CRON_A, RUN_CRON_B,
} from './scripts';
import { RunIt, Lane, Checks } from './parts';
import { t, ta, type Locale } from '../i18n';

export default function FlowsContent({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{t(locale, 'fl_h1')}</h1>
      <p>
        {t(locale, 'fl_intro_a')} <code>.env</code>
        {t(locale, 'fl_intro_b')}
      </p>
      <Legend />

      <h2>{t(locale, 'fl_s1_h')} <Lane>FAST-LANE</Lane></h2>
      <p>{t(locale, 'fl_s1_p')}</p>
      <Diagram steps={HAPPY} edges={['accept', 'deliver', 'apply']} />
      <RunIt script={RUN_HAPPY} />
      <Checks title={t(locale, 'fl_check')} items={ta(locale, 'fl_c1')} />

      <h2>{t(locale, 'fl_s2_h')} <Lane>FAST-LANE</Lane></h2>
      <p>{t(locale, 'fl_s2_p')}</p>
      <Diagram steps={DELAYED} edges={['configure', 'enqueue', 'wait 20s']} />
      <RunIt script={RUN_DELAYED} />
      <Checks title={t(locale, 'fl_check')} items={ta(locale, 'fl_c2')} />

      <h2>{t(locale, 'fl_s3_h')} <Lane>FAST-LANE</Lane></h2>
      <p>{t(locale, 'fl_s3_p')}</p>
      <Diagram steps={FAILURE} edges={['inject', 'exhaust', 'replays → re-fails', 'resend fixed']} />
      <RunIt script={RUN_FAILURE} />
      <Checks title={t(locale, 'fl_check')} items={ta(locale, 'fl_c3')} />

      <h2>{t(locale, 'fl_s4_h')} <Lane>CRON</Lane></h2>
      <p>
        {t(locale, 'fl_s4_pa')} <code>{'{"jobId":"…"}'}</code> {t(locale, 'fl_s4_pb')}
      </p>
      <Diagram steps={CRON} edges={['schedule', 'catch up', 'count']} />
      <h3>{t(locale, 'fl_ta_h')}</h3>
      <RunIt script={RUN_CRON_A} />
      <h3>{t(locale, 'fl_tb_h')}</h3>
      <RunIt script={RUN_CRON_B} />
      <Checks title={t(locale, 'fl_check')} items={ta(locale, 'fl_c4')} />
    </>
  );
}
