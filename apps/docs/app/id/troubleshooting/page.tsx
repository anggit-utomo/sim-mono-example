export default function TroubleshootingDocsId() {
  return (
    <>
      <h1>Pemecahan masalah — saat ada yang salah</h1>
      <table>
        <thead>
          <tr><th>Gejala</th><th>Artinya</th><th>Yang dilakukan</th></tr>
        </thead>
        <tbody>
          <tr><td>Baris PENDING bertambah</td><td>Worker berhenti atau Redis mati</td><td>Jalankan worker / Redis; sweeper mengejar otomatis. Trigger sweep-pending dari Cron untuk mempercepat.</td></tr>
          <tr><td>Baris FAILED</td><td>Payload atau kesalahan sistem</td><td>Baca lastError di Ingests; perbaiki penyebabnya; Requeue.</td></tr>
          <tr><td>Kartu queue unavailable</td><td>Redis tidak terjangkau</td><td>API ingest tetap menerima; halaman inbox tetap jalan; restart Redis, lalu trigger sweeper.</td></tr>
          <tr><td>Retry menjawab not found</td><td>Job kedaluwarsa dari Redis</td><td>Requeue baris inbox dari Ingests saja.</td></tr>
          <tr><td>Update ganda, data lama yang tampil</td><td>Race (keterbatasan yang diketahui)</td><td>Kirim ulang update yang lebih baru; tulisan terbaru menang saat diproses ulang.</td></tr>
        </tbody>
      </table>
      <h2>Data demo dan key (hanya untuk latihan)</h2>
      <ul>
        <li>Header key API: x-api-key: dev-key-1. Panggilan dashboard admin pakai token server-side — Anda tidak perlu mengetiknya.</li>
        <li>Customer bawaan: EXT-000001 … EXT-300000.</li>
        <li>Nama racun untuk drill kegagalan: nama apa pun yang diawali __FAIL__.</li>
      </ul>
    </>
  );
}
