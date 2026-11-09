import { revalidatePath } from 'next/cache';
import { adminGet, adminPost, Page } from '../../lib/admin';
import { RetryButton } from './retry-button';

type JobItem = {
  id: string;
  name: string;
  attemptsMade: number;
  failedReason: string | null;
  timestamp: number;
  processedOn: number | null;
  finishedOn: number | null;
};

async function retryAction(id: string) {
  'use server';
  try {
    await adminPost(`/admin/fast-lane/jobs/${encodeURIComponent(id)}/retry`);
    revalidatePath('/queues');
    return { ok: true, message: `ok: retried ${id}` };
  } catch (e) {
    return { ok: false, message: `error: ${(e as Error).message}` };
  }
}

export default async function Queues({
  searchParams,
}: {
  searchParams: Promise<{ lane?: string; state?: string; page?: string }>;
}) {
  const { lane = 'fast-lane', state = 'waiting', page = '1' } = await searchParams;
  const data = await adminGet<Page<JobItem>>(
    `/admin/queues/${encodeURIComponent(lane)}/jobs?state=${encodeURIComponent(state)}&page=${encodeURIComponent(page)}`,
  );

  return (
    <>
      <h1>Queues</h1>
      <form className="toolbar" method="get">
        <select name="lane" defaultValue={lane}>
          <option value="fast-lane">fast-lane</option>
          <option value="cron">cron</option>
        </select>
        <select name="state" defaultValue={state}>
          {['waiting', 'active', 'delayed', 'completed', 'failed'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit">Show</button>
        <span>
          page {data.page}, {data.items.length} shown
        </span>
        <a href={`/queues?lane=${lane}&state=${state}&page=${Math.max(1, data.page - 1)}`}>Prev</a>
        <a href={`/queues?lane=${lane}&state=${state}&page=${data.page + 1}`}>Next</a>
      </form>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>attempts</th>
            <th>failedReason</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((j) => (
            <tr key={j.id}>
              <td>{j.id}</td>
              <td>{j.name}</td>
              <td>{j.attemptsMade}</td>
              <td>{j.failedReason}</td>
              <td>
                {state === 'failed' && lane === 'fast-lane' && (
                  <RetryButton action={retryAction.bind(null, j.id ?? '')} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
