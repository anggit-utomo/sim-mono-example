export default function LogsDocsId() {
  return (
    <>
      <h1>Logs — riwayat</h1>
      <p>
        Apa itu: riwayat semua yang dikerjakan worker — antrean mana, job apa, COMPLETED atau
        FAILED, berapa percobaan, durasi, error, dan waktu selesai. Filter menurut queue dan
        status. Read-only: tidak ada yang bisa diklik untuk mengubah apa pun, jadi aman untuk audit.
      </p>
      <h2>Cara menguji</h2>
      <p>
        Trigger cron job, requeue baris, atau retry job, lalu filter Logs — baris yang cocok
        muncul dalam hitungan detik. Filter customer-fast-lane + FAILED untuk melihat semua
        percobaan pengiriman yang gagal.
      </p>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
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
