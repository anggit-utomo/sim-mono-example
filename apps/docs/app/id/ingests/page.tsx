export default function IngestsDocsId() {
  return (
    <>
      <h1>Ingests — inbox</h1>
      <p>
        Apa itu: inbox — setiap request yang diterima beserta statusnya. Filter menurut
        status. Setiap baris menunjukkan ID pelanggan, apakah CREATE atau UPDATE, jumlah
        percobaan, dan teks error saat gagal.
      </p>
      <h2>Cara pakai (alat recovery utama)</h2>
      <ul>
        <li>Satu baris macet → Requeue mengirimnya kembali ke fast lane.</li>
        <li>Banyak baris gagal → Requeue all failed mengirim semua baris FAILED yang masih bisa diselamatkan sekaligus.</li>
        <li>Requeue baris DONE itu aman: worker melihatnya sudah done dan melewatinya.</li>
      </ul>
      <h2>Cara menguji</h2>
      <p>
        Filter FAILED → temukan baris __FAIL__boom dengan teks errornya. Tekan Requeue →
        ia jalan lagi (dan gagal lagi sampai penyebabnya diperbaiki, memang itu gunanya:
        loop-nya terlihat dan terkendali). Halaman ini tetap jalan walau Redis mati.
      </p>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
      <div className="toolbar">
        <select disabled><option>FAILED</option><option>PENDING</option><option>DONE</option></select>
        <button disabled>Requeue all failed</button>
      </div>
      <table>
        <thead>
          <tr><th>customer</th><th>kind</th><th>status</th><th>attempts</th><th>lastError</th><th></th></tr>
        </thead>
        <tbody>
          <tr><td>EXT-990001</td><td>CREATE</td><td>FAILED</td><td>3</td><td>injected fault</td><td><button disabled>Requeue</button></td></tr>
          <tr><td>EXT-990002</td><td>UPDATE</td><td>DONE</td><td>1</td><td></td><td><button disabled>Requeue</button></td></tr>
        </tbody>
      </table>
    </>
  );
}
