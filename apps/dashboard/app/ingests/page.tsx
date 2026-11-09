import { revalidatePath } from 'next/cache';
import { adminGet, adminPost, Page } from '../../lib/admin';
import { RequeueAllButton, RequeueOneButton } from './requeue-buttons';

type Ingest = {
  id: string;
  externalId: string;
  operation: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
};

async function requeueOneAction(id: string) {
  'use server';
  try {
    const r = await adminPost<{ jobId: string }>(`/admin/ingests/${encodeURIComponent(id)}/requeue`);
    revalidatePath('/ingests');
    return { ok: true, message: `ok: job ${r.jobId}` };
  } catch (e) {
    return { ok: false, message: `error: ${(e as Error).message}` };
  }
}

async function requeueAllAction() {
  'use server';
  try {
    const r = await adminPost<{ enqueued: number }>('/admin/ingests/requeue-failed');
    revalidatePath('/ingests');
    return { ok: true, message: `ok: enqueued ${r.enqueued}` };
  } catch (e) {
    return { ok: false, message: `error: ${(e as Error).message}` };
  }
}

export default async function Ingests({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status = '', page = '1' } = await searchParams;
  const data = await adminGet<Page<Ingest>>(
    `/admin/ingests?page=${encodeURIComponent(page)}${status ? `&status=${encodeURIComponent(status)}` : ''}`,
  );

  return (
    <>
      <h1>Ingests</h1>
      <form className="toolbar" method="get">
        <select name="status" defaultValue={status}>
          <option value="">all</option>
          {['PENDING', 'PROCESSING', 'DONE', 'FAILED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit">Filter</button>
        <span>
          {data.total} total, page {data.page}
        </span>
        <a href={`/ingests?status=${status}&page=${Math.max(1, data.page - 1)}`}>Prev</a>
        <a href={`/ingests?status=${status}&page=${data.page + 1}`}>Next</a>
        <RequeueAllButton action={requeueAllAction} />
      </form>
      <table>
        <thead>
          <tr>
            <th>externalId</th>
            <th>operation</th>
            <th>status</th>
            <th>attempts</th>
            <th>lastError</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((r) => (
            <tr key={r.id}>
              <td>{r.externalId}</td>
              <td>{r.operation}</td>
              <td>{r.status}</td>
              <td>{r.attempts}</td>
              <td>{r.lastError}</td>
              <td>
                <RequeueOneButton action={requeueOneAction.bind(null, r.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
