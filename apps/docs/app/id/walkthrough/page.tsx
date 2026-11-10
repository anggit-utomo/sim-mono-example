import CopyButton from '../../copy-button';
import { CURL } from '../../walkthrough/script';

export default function WalkthroughDocsId() {
  return (
    <>
      <h1>Panduan — jalur bahagia</h1>
      <ol>
        <li>
          Kirim customer lewat API (ganti ID untuk mengulang): POST /create-customer dengan
          externalId EXT-990001, nama Ada, email ada@example.com dan header x-api-key dev-key-1.
          Anda dapat ingestId, status ACCEPTED, dan delayMs.
        </li>
        <li>Buka Ingests, filter PENDING — baris Anda muncul, lalu berubah DONE dalam sedetik
          (atau setelah delay yang dikonfigurasi — lihat tips di bawah).</li>
        <li>Buka Customers, cari EXT-990001 — Ada ada di sana.</li>
        <li>Kirim update untuk ID yang sama dengan nama baru. Customers menunjukkan satu baris dengan nama baru — yang terbaru menang.</li>
        <li>Buka Logs — satu run COMPLETED untuk ingest Anda.</li>
      </ol>
      <span className="mock-label">Contoh tampilan — bukan data live</span>
      <pre>{JSON.stringify({ externalId: 'EXT-990001', name: 'Ada', email: 'ada@example.com' }, null, 2)}</pre>
      <h2>Coba — curl siap salin-tempel</h2>
      <p>
        Tips training: set <code>FAST_LANE_DELAY_MS=20000</code> di <code>.env</code> lalu restart
        API agar baris baru tertahan di PENDING 20 detik, sehingga sempat terlihat di halaman Ingests.
        Default <code>0</code> langsung terkirim.
      </p>
      <div className="toolbar">
        <CopyButton text={CURL} />
      </div>
      <pre>{CURL}</pre>
      <p>Responsnya (delayMs mengikuti FAST_LANE_DELAY_MS; konsol API juga mencatatnya):</p>
      <pre>{JSON.stringify({ ingestId: '…', status: 'ACCEPTED', delayMs: 20000 }, null, 2)}</pre>
    </>
  );
}
