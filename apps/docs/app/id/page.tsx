export default function OverviewDocsId() {
  return (
    <>
      <h1>Ringkasan — apa itu sistem ini?</h1>
      <p>
        Perusahaan luar mengirimi kami data pelanggan (ID, nama, email). Sistem ini menerima
        data tersebut, menyimpannya ke tabel pelanggan kami, dan memberi operator (Anda) layar
        untuk mengawasi prosesnya serta memperbaiki yang macet.
      </p>
      <h2>Alur kantor pos</h2>
      <ol>
        <li>Pengirim memasukkan surat ke kotak pos — pihak ketiga memanggil API kami.</li>
        <li>
          Petugas memberi cap diterima — API menyimpan record ingest dan menjawab accepted
          dalam sepersekian detik. Pengirim tidak menunggu pengiriman.
        </li>
        <li>
          Kurir langsung mengantar — worker fast-lane menulis pelanggan ke tabel pelanggan,
          biasanya dalam waktu kurang dari satu detik.
        </li>
        <li>
          Setiap 2 menit penyelia memeriksa surat yang belum diambil — sweeper memasukkan
          kembali apa pun yang terlewat kurir.
        </li>
        <li>
          Setiap malam auditor menghitung semuanya — aggregate-stats mencatat total
          untuk halaman Overview.
        </li>
      </ol>
      <h2>Jaminan</h2>
      <ul>
        <li>
          <strong>Tidak ada yang hilang.</strong> Setiap request yang diterima disimpan dulu.
          Setiap request yang diterima berakhir sebagai DONE atau FAILED — tidak pernah hilang diam-diam.
        </li>
        <li>
          <strong>Yang terbaru menang.</strong> Jika dua update untuk pelanggan yang sama berlomba,
          request yang lebih baru menang dan yang lama dilewati sebagai basi.
        </li>
      </ul>
      <h2>Kata-kata yang dipakai di panduan ini</h2>
      <table>
        <thead>
          <tr>
            <th>Kata</th>
            <th>Arti</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Customer</td><td>Kebenaran terkini: satu baris per externalId dengan nama dan email.</td></tr>
          <tr><td>Ingest (baris inbox)</td><td>Satu request yang diterima, dengan status: PENDING, PROCESSING, DONE, FAILED.</td></tr>
          <tr><td>Queue</td><td>Antrean job. customer-fast-lane = kirim sekarang, customer-cron = kerja terjadwal.</td></tr>
          <tr><td>Job</td><td>Satu unit kerja dalam antrean (misalnya: proses satu baris ingest).</td></tr>
          <tr><td>Cron</td><td>Kerja terjadwal: sweeper tiap 2 menit dan stats tiap malam.</td></tr>
          <tr><td>Job run (log)</td><td>Riwayat yang mencatat job selesai atau gagal, beserta lamanya.</td></tr>
        </tbody>
      </table>

      <h2>Layar kesehatan</h2>
      <p>
        Buka Overview asli terlebih dahulu setiap kali ada yang terasa salah. Jika PENDING atau
        FAILED bertambah, buka Ingests. Jika job failed bertambah, buka Queues. Jika kartu
        bertuliskan unavailable (Redis down?), sistem antrean tidak terjangkau — kartu inbox
        tetap berfungsi.
      </p>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
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
