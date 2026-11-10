import Diagram, { Legend } from '../../flows/diagram';
import FlowChart from '../../architecture/detail';
import { DELIVERY, ACCEPT, PROCESS, SWEEP, STATS, ADMIN, INVENTORY } from '../../architecture/data';

export default function ArchitectureDocsId() {
  return (
    <>
      <h1>Arsitektur — seluruh sistem, satu halaman</h1>
      <p>
        Diamond adalah keputusan (ikuti edge ya/tidak). Setiap kotak menyebut fungsi,
        query, dan set yang persis di bawahnya. Lihat <a href="/id/flows">Flows</a> untuk
        drill salin-tempel tiap jalur.
      </p>
      <Legend />

      <h2>Peta — layanan sekilas</h2>
      <Diagram steps={DELIVERY} edges={['POST', 'enqueue', 'consume', 'upsert']} />

      <h2>1 · Accept — controller ke inbox <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={ACCEPT} />

      <h2>2 · Process — delivery worker, semua cabang <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={PROCESS} />

      <h2>3 · Sweep — selamatkan baris macet <span className="lane">CRON</span></h2>
      <FlowChart nodes={SWEEP} />

      <h2>4 · Stats — count malam <span className="lane">CRON</span></h2>
      <FlowChart nodes={STATS} />

      <h2>Peta controller — endpoint → fungsi → query / set</h2>
      <table>
        <thead>
          <tr><th>Endpoint</th><th>Fungsi</th><th>Query / set</th></tr>
        </thead>
        <tbody>
          {ADMIN.map(([e, f, q]) => (
            <tr key={e}>
              <td>{e}</td><td>{f}</td><td>{q}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Inventaris layanan</h2>
      <table>
        <thead>
          <tr><th>Layanan</th><th>Teknologi</th><th>Port</th><th>Peran</th></tr>
        </thead>
        <tbody>
          {INVENTORY.map(([s, t, p, r]) => (
            <tr key={s}>
              <td>{s}</td><td>{t}</td><td>{p}</td><td>{r}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
