export default function QueuesDocsId() {
  return (
    <>
      <h1>Queues — antrean</h1>
      <p>
        Apa itu: antrean, dua jalur. Pilih lane (fast-lane atau cron) dan job state
        (waiting, active, delayed, completed, failed) lalu telusuri job-nya. Setiap baris
        menunjukkan job id, nama, berapa kali percobaan, dan — untuk job gagal — alasan gagalnya.
      </p>
      <h2>Cara pakai</h2>
      <p>
        Saat Overview menunjukkan job gagal, pilih fast-lane + failed, baca failedReason,
        perbaiki penyebabnya, lalu tekan Retry pada job itu. Retry hanya jalan selama job
        masih tersimpan; jika jawabannya not found, job sudah kedaluwarsa dan sebaiknya
        requeue baris inbox dari Ingests saja.
      </p>
      <h2>Cara menguji</h2>
      <p>
        Buat customer bernama __FAIL__boom lewat API (racun sengaja untuk latihan).
        Dalam ~10 detik ia muncul di failed dengan alasan injected fault. Tekan Retry →
        ia jalan lagi dan gagal lagi, membuktikan retry dieksekusi.
      </p>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
      <div className="toolbar">
        <select disabled><option>fast-lane</option><option>cron</option></select>
        <select disabled><option>failed</option><option>waiting</option><option>completed</option></select>
        <button disabled>Retry</button>
      </div>
      <table>
        <thead>
          <tr><th>job id</th><th>name</th><th>attempts</th><th>failedReason</th></tr>
        </thead>
        <tbody>
          <tr><td>job-101</td><td>process-ingest</td><td>3</td><td>injected fault</td></tr>
          <tr><td>job-102</td><td>process-ingest</td><td>1</td><td></td></tr>
        </tbody>
      </table>
    </>
  );
}
