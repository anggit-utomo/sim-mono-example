export default function CustomersDocsId() {
  return (
    <>
      <h1>Customers — tabel pelanggan</h1>
      <p>
        Apa itu: kebenaran yang dijaga seluruh sistem. Diawali dengan 300.000 baris demo
        (EXT-000001 …). 50 baris per halaman agar tetap cepat.
      </p>
      <h2>Cara pakai</h2>
      <p>
        Ketik ID pelanggan yang persis (misalnya EXT-000001) atau awal email (misalnya
        eloise) lalu tekan Search. Pindah halaman dengan Prev/Next.
      </p>
      <h2>Cara menguji</h2>
      <ul>
        <li>Cari EXT-000001 → tepat 1 baris.</li>
        <li>Cari awalan email yang pendek → daftar hasil.</li>
        <li>Buka halaman 2 → 50 baris yang berbeda.</li>
      </ul>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
      <div className="toolbar">
        <input placeholder="EXT-000001 atau awalan email" disabled />
        <button disabled>Search</button>
        <button disabled>Prev</button>
        <button disabled>Next</button>
      </div>
      <table>
        <thead>
          <tr><th>externalId</th><th>name</th><th>email</th></tr>
        </thead>
        <tbody>
          <tr><td>EXT-000001</td><td>Ada</td><td>ada@example.com</td></tr>
          <tr><td>EXT-000002</td><td>Bo</td><td>bo@example.com</td></tr>
        </tbody>
      </table>
    </>
  );
}
