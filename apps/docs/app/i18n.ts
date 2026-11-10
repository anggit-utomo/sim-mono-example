// Central prose dictionary for the docs app (EN + ID). Technical terms, code,
// commands, and mock data stay identical across languages and live with the
// components — only human prose lives here. Missing ID keys fall back to EN.

export type Locale = 'en' | 'id';

export type Pair = { b: string; t: string };
type V = string | string[] | string[][] | Pair[];

const en: Record<string, V> = {
  mock: 'Example view — not live data',

  ov_h1: 'Overview — what is this system?',
  ov_intro:
    'Outside companies send us customer records (an ID, a name, an email). This system receives those records, saves them into our customer table, and gives operators screens to watch the work happen and fix anything that gets stuck.',
  ov_flow_h: 'Post-office flow',
  ov_flow: [
    'A sender drops a letter in the mailbox — a third party calls our API.',
    'The clerk stamps it received — the API stores an ingest record and answers accepted within a fraction of a second. The sender never waits for delivery.',
    'A courier delivers it immediately — the fast-lane worker writes the customer into the customer table, usually in under a second.',
    'Every 2 minutes a supervisor checks for letters nobody picked up — the sweeper re-queues anything the courier missed.',
    'Once a night an auditor counts everything — aggregate-stats records totals for the Overview page.',
  ],
  ov_guar_h: 'Guarantees',
  ov_guar: [
    {
      b: 'Nothing is lost.',
      t: 'Every accepted request is stored first. Every accepted request ends as DONE or FAILED — never silently dropped.',
    },
    {
      b: 'Newest wins.',
      t: 'If two updates for the same customer race, the newer request wins and the older one is skipped as stale.',
    },
  ],
  ov_words_h: 'Words used in this guide',
  ov_th: ['Word', 'Meaning'],
  ov_words: [
    ['Customer', 'The current truth: one row per externalId with name and email.'],
    ['Ingest (inbox row)', 'One accepted request, with a status: PENDING, PROCESSING, DONE, FAILED.'],
    ['Queue', 'A waiting line of jobs. customer-fast-lane = deliver now, customer-cron = scheduled work.'],
    ['Job', 'One unit of work in a queue (for example: process one ingest row).'],
    ['Cron', 'Work on a schedule: the 2-minute sweeper and the nightly stats.'],
    ['Job run (log)', 'A history entry saying a job finished or failed, with how long it took.'],
  ],
  ov_run_h: 'Running locally',
  ov_run_1: 'starts everything. Fixed ports: dashboard on',
  ov_run_2: ', API on',
  ov_run_3: ', this docs app on',
  ov_run_4: '.',
  ov_health_h: 'Health screen',
  ov_health:
    'Open the real Overview first whenever something feels wrong. If PENDING or FAILED is growing, go to Ingests. If failed jobs are growing, go to Queues. If a card says unavailable (Redis down?), the queue system is unreachable — the inbox cards still work.',

  cu_h1: 'Customers — the customer table',
  cu_what:
    'What it is: the truth the whole system maintains. Seeded with 300,000 demo rows (EXT-000001 …). 50 rows per page so it stays fast.',
  cu_use_h: 'How to use it',
  cu_use:
    'Type an exact customer ID (for example EXT-000001) or the start of an email (for example eloise) and press Search. Flip pages with Prev/Next.',
  cu_test_h: 'How to test it',
  cu_ph: 'EXT-000001 or email prefix',
  cu_test: [
    'Search EXT-000001 → exactly 1 row.',
    'Search a short email prefix → a list.',
    'Open page 2 → 50 different rows.',
  ],

  qu_h1: 'Queues — the waiting lines',
  qu_what:
    'What it is: the waiting lines, both lanes. Pick a lane (fast-lane or cron) and a job state (waiting, active, delayed, completed, failed) and page through the jobs. Each row shows the job id, name, how many attempts it took, and — for failed jobs — the failure reason.',
  qu_use_h: 'How to use it',
  qu_use:
    'When the Overview shows failed jobs, select fast-lane + failed, read the failedReason, fix the underlying cause, then press Retry on the job. Retry only works while the job is still stored; if it says not found, the job aged out and you should requeue the inbox row from Ingests instead.',
  qu_test_h: 'How to test it',
  qu_test:
    'Create a customer with name __FAIL__boom through the API (a deliberate poison used for training). Within ~10 seconds it appears under failed with reason injected fault. Press Retry → it runs again and fails again, proving retries execute.',

  cr_h1: 'Cron — the schedules',
  cr_what:
    'What it is: the two schedules — sweep-pending (every 2 minutes) and aggregate-stats (nightly 02:00) — with their pattern, timezone, and the result of their last run.',
  cr_use_h: 'How to use it',
  cr_use:
    'Press Trigger now (you get a confirmation dialog) to run a schedule immediately instead of waiting. Use it after an outage: trigger sweep-pending and watch PENDING rows get picked up. Do not trigger repeatedly — one run is enough; duplicates are harmless but noisy.',
  cr_test_h: 'How to test it',
  cr_test:
    'Press Trigger now on aggregate-stats, confirm, wait a few seconds, reload: its last result updates with fresh customer totals, and a new COMPLETED row appears on the Logs page.',

  in_h1: 'Ingests — the inbox',
  in_what:
    'What it is: the inbox — every accepted request and its status. Filter by status. Each row shows the customer ID, whether it was a CREATE or UPDATE, the attempt count, and the error text when it failed.',
  in_use_h: 'How to use it (main recovery tool)',
  in_use: [
    'One stuck row → Requeue sends it back to the fast lane.',
    'Many failed rows → Requeue all failed sends every recoverable FAILED row back at once.',
    'Requeueing a DONE row is safe: the worker sees it is already done and skips it.',
  ],
  in_test_h: 'How to test it',
  in_test:
    'Filter FAILED → find the __FAIL__boom row with its error text. Press Requeue → it runs again (and fails again until the cause is fixed, which is the point: the loop is visible and controllable). This page keeps working even when Redis is down.',

  lo_h1: 'Logs — the history',
  lo_what:
    'What it is: the history of everything workers did — which queue, which job, COMPLETED or FAILED, attempts used, duration, error, and finish time. Filter by queue and status. Read-only: nothing here can be clicked to change anything, which makes it safe for auditing.',
  lo_test_h: 'How to test it',
  lo_test:
    'Trigger a cron job, requeue a row, or retry a job, then filter Logs — a matching row appears within seconds. Filter customer-fast-lane + FAILED to see every failed delivery attempt.',

  wt_h1: 'Walkthrough — the happy path',
  wt_steps: [
    'Send a customer through the API (replace the ID to repeat): POST /create-customer with externalId EXT-990001, name Ada, email ada@example.com and header x-api-key dev-key-1. You get an ingestId, status ACCEPTED, and delayMs.',
    'Open Ingests, filter PENDING — your row appears, then flips to DONE within a second (or after the configured delay — see training tip below).',
    'Open Customers, search EXT-990001 — Ada is there.',
    'Send an update for the same ID with a new name. Customers shows one row with the new name — newest wins.',
    'Open Logs — one COMPLETED run for your ingest.',
  ],
  wt_try_h: 'Try it — copy-paste curl',
  wt_tip_1: 'Training tip: set',
  wt_tip_2: 'in',
  wt_tip_3:
    'and restart the API to hold new rows in PENDING for 20 seconds, so you can catch them on the Ingests page. Default',
  wt_tip_4: 'delivers immediately.',
  wt_resp: 'You get back (delayMs mirrors FAST_LANE_DELAY_MS; the API console also logs it):',

  ts_h1: 'Troubleshooting — when something looks wrong',
  ts_th: ['Symptom', 'Meaning', 'What to do'],
  ts_rows: [
    ['PENDING rows growing', 'Worker stopped or Redis down', 'Start the worker / Redis; the sweeper catches up automatically. Trigger sweep-pending from Cron to hurry it.'],
    ['FAILED rows', 'Payload or system fault', 'Read lastError on Ingests; fix the cause; Requeue.'],
    ['Queue cards say unavailable', 'Redis unreachable', 'Ingest API still accepts; inbox pages keep working; restart Redis, then trigger the sweeper.'],
    ['Retry says not found', 'Job aged out of Redis', 'Requeue the inbox row from Ingests instead.'],
    ['Same customer updated twice, older data showing', 'Race (known limitation)', 'Re-send the newer update; newest write wins on reprocessing.'],
  ],
  ts_demo_h: 'Demo data and keys (training only)',
  ts_demo: [
    'API key header: x-api-key: dev-key-1. Admin dashboard calls use a server-side token — you never type it.',
    'Seeded customers: EXT-000001 … EXT-300000.',
    'Poison name for failure drills: any name starting with __FAIL__.',
  ],

  fl_h1: 'Flows — system graphs for testing scenarios',
  fl_intro_a:
    'Four end-to-end paths through the system. Each flow has a graph plus a copy-paste script: run the script in a terminal (repo root) and watch each step land on the dashboard pages named under the nodes. Replace EXT- IDs with fresh ones on repeats. Admin calls need ADMIN_TOKEN from',
  fl_intro_b: '; the first line of every script loads it for you.',
  fl_s1_h: '1. Happy path — create to DONE',
  fl_s1_p: 'The first drill every new operator runs.',
  fl_s2_h: '2. Delayed demo — hold PENDING with FAST_LANE_DELAY_MS',
  fl_s2_p: 'Slow the system down so you can catch rows mid-flight on the inbox screen.',
  fl_s3_h: '3. Failure and recovery — poison row drill',
  fl_s3_p:
    'Requeue replays the same payload, so a poison name re-fails — the loop is the drill. Real recovery is a new ingest with fixed data. (The optional sweeper step lives on the cron lane.)',
  fl_s4_h: '4. Cron loops — sweeper and nightly stats',
  fl_s4_pa:
    'Verify the safety nets run on schedule and on demand. Everything here travels the cron lane. The trigger curl only answers',
  fl_s4_pb: '— the proof is on the pages below.',
  fl_ta_h: 'Test A — aggregate-stats (auditor)',
  fl_tb_h: 'Test B — sweep-pending (safety net)',
  fl_check: 'Where to check (dashboard :3000)',
  fl_c1: [
    'Terminal: response shows ingestId, "ACCEPTED", delayMs. API console logs the accept line.',
    'Dashboard → Ingests → Status = PENDING → your EXT- row, attempts 0.',
    'Dashboard → Queues → lane fast-lane, state waiting (then active) → job ingest-<id>-0.',
    'Dashboard → Ingests → Status = DONE; Customers → search the ID; Logs → queue customer-fast-lane, COMPLETED.',
  ],
  fl_c2: [
    'Terminal/.env: set FAST_LANE_DELAY_MS=20000, restart API (Ctrl+C, pnpm dev).',
    'Terminal: response shows "delayMs": 20000; API console logs delay=20s.',
    'Dashboard → Queues → lane fast-lane, state delayed → your job; Ingests → PENDING. Overview fast-lane card shows delayed: 1.',
    'Dashboard → Ingests → DONE; delayed back to 0; Logs → COMPLETED run.',
  ],
  fl_c3: [
    'Terminal: poison create accepted.',
    'Dashboard → Ingests → Status = FAILED → lastError "injected fault", attempts 3. Queues → lane fast-lane, state failed.',
    'Dashboard → Ingests → the same row, attempts 6, still FAILED. Queues → failed again.',
    'Terminal: update-customer with the fixed name (new ingest).',
    'Dashboard → Customers → search ID shows fixed name; Ingests → DONE on the new row (poison row stays FAILED as history); Logs → COMPLETED.',
  ],
  fl_c4: [
    'Test A trigger: terminal (or dashboard → Cron → Trigger now on aggregate-stats).',
    'Test A proof: Logs → queue customer-cron, COMPLETED → aggregate-stats row with counts JSON; Overview → Latest stats updates; Cron page → last result updates (reload).',
    'Test B setup: poison create → Ingests → FAILED, attempts 3; then trigger (terminal or Cron → Trigger now on sweep-pending).',
    'Test B proof: Logs → sweep-pending row result {"enqueued":1}; Ingests → FAILED attempts 3 → 6; Queues → fast-lane waiting/active (brief); Cron page → fresh enqueued count.',
  ],

  ar_h1: 'Architecture — whole system, one page',
  ar_intro:
    'Diamonds are decisions (follow the yes/no edge). Every box names the exact function, query, and set underneath. See',
  ar_intro_link: 'Flows',
  ar_intro_end: 'for the copy-paste drills of each path.',
  ar_map_h: 'Map — services at a glance',
  ar_s1_h: '1 · Accept — controller to inbox',
  ar_s2_h: '2 · Process — worker delivery, every branch',
  ar_s3_h: '3 · Sweep — rescue stuck rows',
  ar_s4_h: '4 · Stats — nightly count',
  ar_ctrl_h: 'Controller map — endpoint → function → query / set',
  ar_ctrl_th: ['Endpoint', 'Function', 'Query / set'],
  ar_inv_h: 'Service inventory',
  ar_inv_th: ['Service', 'Tech', 'Port', 'Role'],
};

const id: Record<string, V> = {
  mock: 'Contoh tampilan — bukan data live',

  ov_h1: 'Ringkasan — apa itu sistem ini?',
  ov_intro:
    'Perusahaan luar mengirimi kami data pelanggan (ID, nama, email). Sistem ini menerima data tersebut, menyimpannya ke tabel pelanggan kami, dan memberi operator (Anda) layar untuk mengawasi prosesnya serta memperbaiki yang macet.',
  ov_flow_h: 'Alur kantor pos',
  ov_flow: [
    'Pengirim memasukkan surat ke kotak pos — pihak ketiga memanggil API kami.',
    'Petugas memberi cap diterima — API menyimpan record ingest dan menjawab accepted dalam sepersekian detik. Pengirim tidak menunggu pengiriman.',
    'Kurir langsung mengantar — worker fast-lane menulis pelanggan ke tabel pelanggan, biasanya dalam waktu kurang dari satu detik.',
    'Setiap 2 menit penyelia memeriksa surat yang belum diambil — sweeper memasukkan kembali apa pun yang terlewat kurir.',
    'Setiap malam auditor menghitung semuanya — aggregate-stats mencatat total untuk halaman Overview.',
  ],
  ov_guar_h: 'Jaminan',
  ov_guar: [
    {
      b: 'Tidak ada yang hilang.',
      t: 'Setiap request yang diterima disimpan dulu. Setiap request yang diterima berakhir sebagai DONE atau FAILED — tidak pernah hilang diam-diam.',
    },
    {
      b: 'Yang terbaru menang.',
      t: 'Jika dua update untuk pelanggan yang sama berlomba, request yang lebih baru menang dan yang lama dilewati sebagai basi.',
    },
  ],
  ov_words_h: 'Kata-kata yang dipakai di panduan ini',
  ov_th: ['Kata', 'Arti'],
  ov_words: [
    ['Customer', 'Kebenaran terkini: satu baris per externalId dengan nama dan email.'],
    ['Ingest (baris inbox)', 'Satu request yang diterima, dengan status: PENDING, PROCESSING, DONE, FAILED.'],
    ['Queue', 'Antrean job. customer-fast-lane = kirim sekarang, customer-cron = kerja terjadwal.'],
    ['Job', 'Satu unit kerja dalam antrean (misalnya: proses satu baris ingest).'],
    ['Cron', 'Kerja terjadwal: sweeper tiap 2 menit dan stats tiap malam.'],
    ['Job run (log)', 'Riwayat yang mencatat job selesai atau gagal, beserta lamanya.'],
  ],
  ov_run_h: 'Berjalan lokal',
  ov_run_1: 'menjalankan semuanya. Port tetap: dashboard di',
  ov_run_2: ', API di',
  ov_run_3: ', app docs ini di',
  ov_run_4: '.',
  ov_health_h: 'Layar kesehatan',
  ov_health:
    'Buka Overview asli terlebih dahulu setiap kali ada yang terasa salah. Jika PENDING atau FAILED bertambah, buka Ingests. Jika job failed bertambah, buka Queues. Jika kartu bertuliskan unavailable (Redis down?), sistem antrean tidak terjangkau — kartu inbox tetap berfungsi.',

  cu_h1: 'Customers — tabel pelanggan',
  cu_what:
    'Apa itu: kebenaran yang dijaga seluruh sistem. Diawali dengan 300.000 baris demo (EXT-000001 …). 50 baris per halaman agar tetap cepat.',
  cu_use_h: 'Cara pakai',
  cu_use:
    'Ketik ID pelanggan yang persis (misalnya EXT-000001) atau awal email (misalnya eloise) lalu tekan Search. Pindah halaman dengan Prev/Next.',
  cu_test_h: 'Cara menguji',
  cu_ph: 'EXT-000001 atau awalan email',
  cu_test: [
    'Cari EXT-000001 → tepat 1 baris.',
    'Cari awalan email yang pendek → daftar hasil.',
    'Buka halaman 2 → 50 baris yang berbeda.',
  ],

  qu_h1: 'Queues — antrean',
  qu_what:
    'Apa itu: antrean, dua jalur. Pilih lane (fast-lane atau cron) dan job state (waiting, active, delayed, completed, failed) lalu telusuri job-nya. Setiap baris menunjukkan job id, nama, berapa kali percobaan, dan — untuk job gagal — alasan gagalnya.',
  qu_use_h: 'Cara pakai',
  qu_use:
    'Saat Overview menunjukkan job gagal, pilih fast-lane + failed, baca failedReason, perbaiki penyebabnya, lalu tekan Retry pada job itu. Retry hanya jalan selama job masih tersimpan; jika jawabannya not found, job sudah kedaluwarsa dan sebaiknya requeue baris inbox dari Ingests saja.',
  qu_test_h: 'Cara menguji',
  qu_test:
    'Buat customer bernama __FAIL__boom lewat API (racun sengaja untuk latihan). Dalam ~10 detik ia muncul di failed dengan alasan injected fault. Tekan Retry → ia jalan lagi dan gagal lagi, membuktikan retry dieksekusi.',

  cr_h1: 'Cron — jadwal',
  cr_what:
    'Apa itu: dua jadwal — sweep-pending (tiap 2 menit) dan aggregate-stats (tiap malam 02:00) — beserta pattern, timezone, dan hasil run terakhirnya.',
  cr_use_h: 'Cara pakai',
  cr_use:
    'Tekan Trigger now (Anda dapat dialog konfirmasi) untuk menjalankan jadwal segera tanpa menunggu. Pakai setelah outage: trigger sweep-pending dan lihat baris PENDING diambil. Jangan trigger berulang — sekali cukup; duplikat tidak berbahaya tapi berisik.',
  cr_test_h: 'Cara menguji',
  cr_test:
    'Tekan Trigger now pada aggregate-stats, konfirmasi, tunggu beberapa detik, reload: hasil terakhirnya update dengan total customer terbaru, dan baris COMPLETED baru muncul di halaman Logs.',

  in_h1: 'Ingests — inbox',
  in_what:
    'Apa itu: inbox — setiap request yang diterima beserta statusnya. Filter menurut status. Setiap baris menunjukkan ID pelanggan, apakah CREATE atau UPDATE, jumlah percobaan, dan teks error saat gagal.',
  in_use_h: 'Cara pakai (alat recovery utama)',
  in_use: [
    'Satu baris macet → Requeue mengirimnya kembali ke fast lane.',
    'Banyak baris gagal → Requeue all failed mengirim semua baris FAILED yang masih bisa diselamatkan sekaligus.',
    'Requeue baris DONE itu aman: worker melihatnya sudah done dan melewatinya.',
  ],
  in_test_h: 'Cara menguji',
  in_test:
    'Filter FAILED → temukan baris __FAIL__boom dengan teks errornya. Tekan Requeue → ia jalan lagi (dan gagal lagi sampai penyebabnya diperbaiki, memang itu gunanya: loop-nya terlihat dan terkendali). Halaman ini tetap jalan walau Redis mati.',

  lo_h1: 'Logs — riwayat',
  lo_what:
    'Apa itu: riwayat semua yang dikerjakan worker — antrean mana, job apa, COMPLETED atau FAILED, berapa percobaan, durasi, error, dan waktu selesai. Filter menurut queue dan status. Read-only: tidak ada yang bisa diklik untuk mengubah apa pun, jadi aman untuk audit.',
  lo_test_h: 'Cara menguji',
  lo_test:
    'Trigger cron job, requeue baris, atau retry job, lalu filter Logs — baris yang cocok muncul dalam hitungan detik. Filter customer-fast-lane + FAILED untuk melihat semua percobaan pengiriman yang gagal.',

  wt_h1: 'Panduan — jalur bahagia',
  wt_steps: [
    'Kirim customer lewat API (ganti ID untuk mengulang): POST /create-customer dengan externalId EXT-990001, nama Ada, email ada@example.com dan header x-api-key dev-key-1. Anda dapat ingestId, status ACCEPTED, dan delayMs.',
    'Buka Ingests, filter PENDING — baris Anda muncul, lalu berubah DONE dalam sedetik (atau setelah delay yang dikonfigurasi — lihat tips di bawah).',
    'Buka Customers, cari EXT-990001 — Ada ada di sana.',
    'Kirim update untuk ID yang sama dengan nama baru. Customers menunjukkan satu baris dengan nama baru — yang terbaru menang.',
    'Buka Logs — satu run COMPLETED untuk ingest Anda.',
  ],
  wt_try_h: 'Coba — curl siap salin-tempel',
  wt_tip_1: 'Tips training: set',
  wt_tip_2: 'di',
  wt_tip_3:
    'lalu restart API agar baris baru tertahan di PENDING 20 detik, sehingga sempat terlihat di halaman Ingests. Default',
  wt_tip_4: 'langsung terkirim.',
  wt_resp: 'Responsnya (delayMs mengikuti FAST_LANE_DELAY_MS; konsol API juga mencatatnya):',

  ts_h1: 'Pemecahan masalah — saat ada yang salah',
  ts_th: ['Gejala', 'Artinya', 'Yang dilakukan'],
  ts_rows: [
    ['Baris PENDING bertambah', 'Worker berhenti atau Redis mati', 'Jalankan worker / Redis; sweeper mengejar otomatis. Trigger sweep-pending dari Cron untuk mempercepat.'],
    ['Baris FAILED', 'Payload atau kesalahan sistem', 'Baca lastError di Ingests; perbaiki penyebabnya; Requeue.'],
    ['Kartu queue unavailable', 'Redis tidak terjangkau', 'API ingest tetap menerima; halaman inbox tetap jalan; restart Redis, lalu trigger sweeper.'],
    ['Retry menjawab not found', 'Job kedaluwarsa dari Redis', 'Requeue baris inbox dari Ingests saja.'],
    ['Update ganda, data lama yang tampil', 'Race (keterbatasan yang diketahui)', 'Kirim ulang update yang lebih baru; tulisan terbaru menang saat diproses ulang.'],
  ],
  ts_demo_h: 'Data demo dan key (hanya untuk latihan)',
  ts_demo: [
    'Header key API: x-api-key: dev-key-1. Panggilan dashboard admin pakai token server-side — Anda tidak perlu mengetiknya.',
    'Customer bawaan: EXT-000001 … EXT-300000.',
    'Nama racun untuk drill kegagalan: nama apa pun yang diawali __FAIL__.',
  ],

  fl_h1: 'Alur — graf sistem untuk skenario pengujian',
  fl_intro_a:
    'Empat jalur end-to-end. Setiap alur punya graf plus skrip siap salin: jalankan skrip di terminal (root repo) dan saksikan tiap langkah mendarat di halaman dashboard yang disebut di bawah node. Ganti EXT- ID dengan yang baru setiap mengulang. Panggilan admin butuh ADMIN_TOKEN dari',
  fl_intro_b: '; baris pertama tiap skrip memuatnya untuk Anda.',
  fl_s1_h: '1. Jalur bahagia — create sampai DONE',
  fl_s1_p: 'Drill pertama setiap operator baru.',
  fl_s2_h: '2. Demo tertunda — tahan PENDING dengan FAST_LANE_DELAY_MS',
  fl_s2_p: 'Perlambat sistem agar baris sempat terlihat di layar inbox.',
  fl_s3_h: '3. Kegagalan dan recovery — drill baris racun',
  fl_s3_p:
    'Requeue memutar ulang payload yang sama, jadi nama racun gagal lagi — loop-nya adalah drill-nya. Recovery yang sebenarnya adalah ingest baru dengan data yang diperbaiki. (Langkah sweeper opsional lewat jalur cron.)',
  fl_s4_h: '4. Loop cron — sweeper dan stats malam',
  fl_s4_pa:
    'Verifikasi jaring pengaman jalan sesuai jadwal dan on demand. Semua di jalur cron. Curl trigger hanya menjawab',
  fl_s4_pb: '— buktinya ada di halaman-halaman di bawah.',
  fl_ta_h: 'Test A — aggregate-stats (auditor)',
  fl_tb_h: 'Test B — sweep-pending (jaring pengaman)',
  fl_check: 'Di mana memeriksa (dashboard :3000)',
  fl_c1: [
    'Terminal: respons menampilkan ingestId, "ACCEPTED", delayMs. Konsol API mencatat baris accept.',
    'Dashboard → Ingests → Status = PENDING → baris EXT- Anda, attempts 0.',
    'Dashboard → Queues → lane fast-lane, state waiting (lalu active) → job ingest-<id>-0.',
    'Dashboard → Ingests → Status = DONE; Customers → cari ID; Logs → queue customer-fast-lane, COMPLETED.',
  ],
  fl_c2: [
    'Terminal/.env: set FAST_LANE_DELAY_MS=20000, restart API (Ctrl+C, pnpm dev).',
    'Terminal: respons menampilkan "delayMs": 20000; konsol API mencatat delay=20s.',
    'Dashboard → Queues → lane fast-lane, state delayed → job Anda; Ingests → PENDING. Kartu fast-lane Overview menunjukkan delayed: 1.',
    'Dashboard → Ingests → DONE; delayed kembali 0; Logs → run COMPLETED.',
  ],
  fl_c3: [
    'Terminal: create racun diterima.',
    'Dashboard → Ingests → Status = FAILED → lastError "injected fault", attempts 3. Queues → lane fast-lane, state failed.',
    'Dashboard → Ingests → baris yang sama, attempts 6, tetap FAILED. Queues → failed lagi.',
    'Terminal: update-customer dengan nama yang benar (ingest baru).',
    'Dashboard → Customers → cari ID menunjukkan nama yang diperbaiki; Ingests → DONE pada baris baru (baris racun tetap FAILED sebagai riwayat); Logs → COMPLETED.',
  ],
  fl_c4: [
    'Trigger Test A: terminal (atau dashboard → Cron → Trigger now pada aggregate-stats).',
    'Bukti Test A: Logs → queue customer-cron, COMPLETED → baris aggregate-stats dengan JSON count; Overview → Latest stats update; halaman Cron → last result update (reload).',
    'Setup Test B: create racun → Ingests → FAILED, attempts 3; lalu trigger (terminal atau Cron → Trigger now pada sweep-pending).',
    'Bukti Test B: Logs → baris sweep-pending hasil {"enqueued":1}; Ingests → FAILED attempts 3 → 6; Queues → fast-lane waiting/active (sekilas); halaman Cron → count enqueued terbaru.',
  ],

  ar_h1: 'Arsitektur — seluruh sistem, satu halaman',
  ar_intro:
    'Diamond adalah keputusan (ikuti edge ya/tidak). Setiap kotak menyebut fungsi, query, dan set yang persis di bawahnya. Lihat',
  ar_intro_link: 'Flows',
  ar_intro_end: 'untuk drill salin-tempel tiap jalur.',
  ar_map_h: 'Peta — layanan sekilas',
  ar_s1_h: '1 · Accept — controller ke inbox',
  ar_s2_h: '2 · Process — delivery worker, semua cabang',
  ar_s3_h: '3 · Sweep — selamatkan baris macet',
  ar_s4_h: '4 · Stats — count malam',
  ar_ctrl_h: 'Peta controller — endpoint → fungsi → query / set',
  ar_ctrl_th: ['Endpoint', 'Fungsi', 'Query / set'],
  ar_inv_h: 'Inventaris layanan',
  ar_inv_th: ['Layanan', 'Teknologi', 'Port', 'Peran'],
};

function pick(locale: Locale, key: string): V {
  if (locale === 'id') return id[key] ?? en[key];
  return en[key];
}

export function t(locale: Locale, key: string): string {
  const v = pick(locale, key);
  return typeof v === 'string' ? v : '';
}

export function ta(locale: Locale, key: string): string[] {
  const v = pick(locale, key);
  return Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : [];
}

export function tm(locale: Locale, key: string): string[][] {
  const v = pick(locale, key);
  return Array.isArray(v) && v.every((x) => Array.isArray(x)) ? (v as string[][]) : [];
}

export function tp(locale: Locale, key: string): Pair[] {
  const v = pick(locale, key);
  return Array.isArray(v) && v.every((x) => !Array.isArray(x) && typeof x === 'object') ? (v as Pair[]) : [];
}
