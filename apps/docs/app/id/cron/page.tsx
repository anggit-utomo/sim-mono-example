export default function CronDocsId() {
  return (
    <>
      <h1>Cron — jadwal</h1>
      <p>
        Apa itu: dua jadwal — sweep-pending (tiap 2 menit) dan aggregate-stats
        (tiap malam 02:00) — beserta pattern, timezone, dan hasil run terakhirnya.
      </p>
      <h2>Cara pakai</h2>
      <p>
        Tekan Trigger now (Anda dapat dialog konfirmasi) untuk menjalankan jadwal segera
        tanpa menunggu. Pakai setelah outage: trigger sweep-pending dan lihat baris PENDING
        diambil. Jangan trigger berulang — sekali cukup; duplikat tidak berbahaya tapi berisik.
      </p>
      <h2>Cara menguji</h2>
      <p>
        Tekan Trigger now pada aggregate-stats, konfirmasi, tunggu beberapa detik, reload:
        hasil terakhirnya update dengan total customer terbaru, dan baris COMPLETED baru
        muncul di halaman Logs.
      </p>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
      <table>
        <thead>
          <tr><th>job</th><th>pattern</th><th>timezone</th><th>last result</th><th></th></tr>
        </thead>
        <tbody>
          <tr><td>sweep-pending</td><td>every 2 minutes</td><td>UTC</td><td>requeued 2</td><td><button disabled>Trigger now</button></td></tr>
          <tr><td>aggregate-stats</td><td>02:00 nightly</td><td>UTC</td><td>customers 300000</td><td><button disabled>Trigger now</button></td></tr>
        </tbody>
      </table>
    </>
  );
}
