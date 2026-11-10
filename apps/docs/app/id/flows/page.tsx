import Diagram, { Legend } from '../../flows/diagram';
import {
  HAPPY, RUN_HAPPY, DELAYED, RUN_DELAYED, FAILURE, RUN_FAILURE,
  CRON, RUN_CRON_A, RUN_CRON_B,
} from '../../flows/scripts';
import { RunIt, Lane, Checks } from '../../flows/parts';

export default function FlowsDocsId() {
  return (
    <>
      <h1>Alur — graf sistem untuk skenario pengujian</h1>
      <p>
        Empat jalur end-to-end. Setiap alur punya graf plus skrip siap salin: jalankan skrip di
        terminal (root repo) dan saksikan tiap langkah mendarat di halaman dashboard yang
        disebut di bawah node. Ganti EXT- ID dengan yang baru setiap mengulang. Panggilan admin
        butuh ADMIN_TOKEN dari <code>.env</code>; baris pertama tiap skrip memuatnya untuk Anda.
      </p>
      <Legend />

      <h2>1. Jalur bahagia — create sampai DONE <Lane>FAST-LANE</Lane></h2>
      <p>Drill pertama setiap operator baru.</p>
      <Diagram steps={HAPPY} edges={['accept', 'deliver', 'apply']} />
      <RunIt script={RUN_HAPPY} />
      <Checks title="Di mana memeriksa (dashboard :3000)"
        items={[
          'Terminal: respons menampilkan ingestId, "ACCEPTED", delayMs. Konsol API mencatat baris accept.',
          'Dashboard → Ingests → Status = PENDING → baris EXT- Anda, attempts 0.',
          'Dashboard → Queues → lane fast-lane, state waiting (lalu active) → job ingest-<id>-0.',
          'Dashboard → Ingests → Status = DONE; Customers → cari ID; Logs → queue customer-fast-lane, COMPLETED.',
        ]}
      />

      <h2>2. Demo tertunda — tahan PENDING dengan FAST_LANE_DELAY_MS <Lane>FAST-LANE</Lane></h2>
      <p>Perlambat sistem agar baris sempat terlihat di layar inbox.</p>
      <Diagram steps={DELAYED} edges={['configure', 'enqueue', 'wait 20s']} />
      <RunIt script={RUN_DELAYED} />
      <Checks title="Di mana memeriksa (dashboard :3000)"
        items={[
          'Terminal/.env: set FAST_LANE_DELAY_MS=20000, restart API (Ctrl+C, pnpm dev).',
          'Terminal: respons menampilkan "delayMs": 20000; konsol API mencatat delay=20s.',
          'Dashboard → Queues → lane fast-lane, state delayed → job Anda; Ingests → PENDING. Kartu fast-lane Overview menunjukkan delayed: 1.',
          'Dashboard → Ingests → DONE; delayed kembali 0; Logs → run COMPLETED.',
        ]}
      />

      <h2>3. Kegagalan dan recovery — drill baris racun <Lane>FAST-LANE</Lane></h2>
      <p>Requeue memutar ulang payload yang sama, jadi nama racun gagal lagi — loop-nya adalah drill-nya.
        Recovery yang sebenarnya adalah ingest baru dengan data yang diperbaiki. (Langkah sweeper opsional lewat jalur cron.)</p>
      <Diagram steps={FAILURE} edges={['inject', 'exhaust', 'replays → re-fails', 'resend fixed']} />
      <RunIt script={RUN_FAILURE} />
      <Checks title="Di mana memeriksa (dashboard :3000)"
        items={[
          'Terminal: create racun diterima.',
          'Dashboard → Ingests → Status = FAILED → lastError "injected fault", attempts 3. Queues → lane fast-lane, state failed.',
          'Dashboard → Ingests → baris yang sama, attempts 6, tetap FAILED. Queues → failed lagi.',
          'Terminal: update-customer dengan nama yang benar (ingest baru).',
          'Dashboard → Customers → cari ID, nama sudah diperbaiki; Ingests → DONE pada baris baru (baris racun tetap FAILED sebagai riwayat); Logs → COMPLETED.',
        ]}
      />

      <h2>4. Loop cron — sweeper dan stats malam <Lane>CRON</Lane></h2>
      <p>Verifikasi jaring pengaman jalan sesuai jadwal dan on-demand. Semua di jalur cron.
        Curl trigger hanya menjawab <code>{'{"jobId":"…"}'}</code> — buktinya ada di halaman-halaman di bawah.</p>
      <Diagram steps={CRON} edges={['schedule', 'catch up', 'count']} />
      <h3>Test A — aggregate-stats (auditor)</h3>
      <RunIt script={RUN_CRON_A} />
      <h3>Test B — sweep-pending (jaring pengaman)</h3>
      <RunIt script={RUN_CRON_B} />
      <Checks title="Di mana memeriksa (dashboard :3000)"
        items={[
          'Trigger Test A: terminal (atau dashboard → Cron → Trigger now pada aggregate-stats).',
          'Bukti Test A: Logs → queue customer-cron, COMPLETED → baris aggregate-stats dengan JSON count; Overview → Latest stats update; halaman Cron → last result update (reload).',
          'Setup Test B: create racun → Ingests → FAILED, attempts 3; lalu trigger (terminal atau Cron → Trigger now pada sweep-pending).',
          'Bukti Test B: Logs → baris sweep-pending hasil {"enqueued":1}; Ingests → FAILED attempts 3 → 6; Queues → fast-lane waiting/active (sekilas); halaman Cron → count enqueued terbaru.',
        ]}
      />
    </>
  );
}
