import { adminGet, Page } from '../lib/admin';

type Counts = Record<string, number>;

const QUEUE_DOWN = 'unavailable (Redis down?)';

async function tryGet<T>(op: Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    return { ok: true, value: await op };
  } catch {
    return { ok: false };
  }
}

export default async function Overview() {
  const [queues, pending, processing, done, failed, runs] = await Promise.all([
    tryGet(adminGet<{ fastLane: Counts; cron: Counts }>('/admin/queues')),
    tryGet(adminGet<Page<unknown>>('/admin/ingests?status=PENDING')),
    tryGet(adminGet<Page<unknown>>('/admin/ingests?status=PROCESSING')),
    tryGet(adminGet<Page<unknown>>('/admin/ingests?status=DONE')),
    tryGet(adminGet<Page<unknown>>('/admin/ingests?status=FAILED')),
    tryGet(
      adminGet<Page<{ jobName: string; result: unknown; finishedAt: string }>>(
        '/admin/job-runs?queue=customer-cron&status=COMPLETED',
      ),
    ),
  ]);

  const latestStats =
    runs.ok && runs.value ? runs.value.items.find((r) => r.jobName === 'aggregate-stats') : null;

  const renderCounts = (counts: Counts) =>
    Object.entries(counts).map(([k, v]) => (
      <span key={k}>
        {k}: <strong>{v}</strong>{' '}
      </span>
    ));

  const inbox = (r: { ok: boolean; value?: Page<unknown> }) =>
    r.ok && r.value ? <strong>{r.value.total}</strong> : <span className="error">{QUEUE_DOWN}</span>;

  return (
    <>
      <h1>Overview</h1>
      <div className="cards">
        <div className="card">
          <h3>Fast lane</h3>
          <p>
            {queues.ok ? (
              renderCounts(queues.value.fastLane)
            ) : (
              <span className="error">{QUEUE_DOWN}</span>
            )}
          </p>
        </div>
        <div className="card">
          <h3>Cron</h3>
          <p>
            {queues.ok ? (
              renderCounts(queues.value.cron)
            ) : (
              <span className="error">{QUEUE_DOWN}</span>
            )}
          </p>
        </div>
        <div className="card">
          <h3>Inbox</h3>
          <p>
            PENDING: {inbox(pending)} PROCESSING: {inbox(processing)} DONE: {inbox(done)} FAILED:{' '}
            {inbox(failed)}
          </p>
        </div>
        <div className="card">
          <h3>Latest stats</h3>
          <pre>{latestStats ? JSON.stringify(latestStats.result) : 'none yet'}</pre>
        </div>
      </div>
    </>
  );
}
