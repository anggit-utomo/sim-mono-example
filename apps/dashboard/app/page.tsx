import { adminGet, Page } from '../lib/admin';

type Counts = Record<string, number>;

export default async function Overview() {
  const [queues, pending, processing, done, failed, runs] = await Promise.all([
    adminGet<{ fastLane: Counts; cron: Counts }>('/admin/queues'),
    adminGet<Page<unknown>>('/admin/ingests?status=PENDING'),
    adminGet<Page<unknown>>('/admin/ingests?status=PROCESSING'),
    adminGet<Page<unknown>>('/admin/ingests?status=DONE'),
    adminGet<Page<unknown>>('/admin/ingests?status=FAILED'),
    adminGet<Page<{ jobName: string; result: unknown; finishedAt: string }>>(
      '/admin/job-runs?queue=customer-cron&status=COMPLETED',
    ),
  ]);
  const latestStats = runs.items.find((r) => r.jobName === 'aggregate-stats');

  const renderCounts = (counts: Counts) =>
    Object.entries(counts).map(([k, v]) => (
      <span key={k}>
        {k}: <strong>{v}</strong>{' '}
      </span>
    ));

  return (
    <>
      <h1>Overview</h1>
      <div className="cards">
        <div className="card">
          <h3>Fast lane</h3>
          <p>{renderCounts(queues.fastLane)}</p>
        </div>
        <div className="card">
          <h3>Cron</h3>
          <p>{renderCounts(queues.cron)}</p>
        </div>
        <div className="card">
          <h3>Inbox</h3>
          <p>
            PENDING: <strong>{pending.total}</strong> PROCESSING:{' '}
            <strong>{processing.total}</strong> DONE: <strong>{done.total}</strong> FAILED:{' '}
            <strong>{failed.total}</strong>
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
