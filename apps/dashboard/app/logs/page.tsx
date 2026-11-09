import { adminGet, Page } from '../../lib/admin';

type JobRun = {
  id: string;
  queue: string;
  jobName: string;
  jobId: string;
  status: string;
  attemptsMade: number;
  durationMs: number;
  error: string | null;
  result: unknown;
  finishedAt: string;
};

export default async function Logs({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string; status?: string; page?: string }>;
}) {
  const { queue = '', status = '', page = '1' } = await searchParams;
  const data = await adminGet<Page<JobRun>>(
    `/admin/job-runs?page=${encodeURIComponent(page)}${queue ? `&queue=${encodeURIComponent(queue)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`,
  );

  return (
    <>
      <h1>Logs</h1>
      <form className="toolbar" method="get">
        <select name="queue" defaultValue={queue}>
          <option value="">all queues</option>
          <option value="customer-fast-lane">customer-fast-lane</option>
          <option value="customer-cron">customer-cron</option>
        </select>
        <select name="status" defaultValue={status}>
          <option value="">all statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
        </select>
        <button type="submit">Filter</button>
        <span>
          {data.total} total, page {data.page}
        </span>
        <a href={`/logs?queue=${queue}&status=${status}&page=${Math.max(1, data.page - 1)}`}>Prev</a>
        <a href={`/logs?queue=${queue}&status=${status}&page=${data.page + 1}`}>Next</a>
      </form>
      <table>
        <thead>
          <tr>
            <th>queue</th>
            <th>jobName</th>
            <th>status</th>
            <th>attempts</th>
            <th>durationMs</th>
            <th>error</th>
            <th>finishedAt</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((r) => (
            <tr key={r.id}>
              <td>{r.queue}</td>
              <td>{r.jobName}</td>
              <td>{r.status}</td>
              <td>{r.attemptsMade}</td>
              <td>{r.durationMs}</td>
              <td>{r.error}</td>
              <td>{r.finishedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
