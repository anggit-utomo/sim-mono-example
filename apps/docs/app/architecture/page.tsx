import Diagram, { Legend } from '../flows/diagram';
import FlowChart from './detail';
import { DELIVERY, ACCEPT, PROCESS, SWEEP, STATS, ADMIN, INVENTORY } from './data';


export default function ArchitectureDocs() {
  return (
    <>
      <h1>Architecture — whole system, one page</h1>
      <p>
        Diamonds are decisions (follow the yes/no edge). Every box names the exact function,
        query, and set underneath. See <a href="/flows">Flows</a> for the copy-paste drills.
      </p>
      <Legend />

      <h2>Map — services at a glance</h2>
      <Diagram steps={DELIVERY} edges={['POST', 'enqueue', 'consume', 'upsert']} />

      <h2>1 · Accept — controller to inbox <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={ACCEPT} />

      <h2>2 · Process — worker delivery, every branch <span className="lane">FAST-LANE</span></h2>
      <FlowChart nodes={PROCESS} />

      <h2>3 · Sweep — rescue stuck rows <span className="lane">CRON</span></h2>
      <FlowChart nodes={SWEEP} />

      <h2>4 · Stats — nightly count <span className="lane">CRON</span></h2>
      <FlowChart nodes={STATS} />

      <h2>Controller map — endpoint → function → query / set</h2>
      <table>
        <thead>
          <tr><th>Endpoint</th><th>Function</th><th>Query / set</th></tr>
        </thead>
        <tbody>
          {ADMIN.map(([e, f, q]) => (
            <tr key={e}>
              <td>{e}</td><td>{f}</td><td>{q}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Service inventory</h2>
      <table>
        <thead>
          <tr><th>Service</th><th>Tech</th><th>Port</th><th>Role</th></tr>
        </thead>
        <tbody>
          {INVENTORY.map(([s, t, p, r]) => (
            <tr key={s}>
              <td>{s}</td><td>{t}</td><td>{p}</td><td>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
