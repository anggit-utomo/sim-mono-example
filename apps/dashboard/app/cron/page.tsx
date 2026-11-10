import { revalidatePath } from 'next/cache';
import { adminGet, adminPost } from '../../lib/admin';
import { TriggerButton } from './trigger-button';

type Scheduler = {
  name: string;
  pattern: string | null;
  tz: string | null;
  lastResult: { status: string; finishedAt: string; result: unknown; error: string | null } | null;
};

async function triggerAction(name: string) {
  'use server';
  try {
    const r = await adminPost<{ jobId: string }>(`/admin/cron/${encodeURIComponent(name)}/trigger`);
    revalidatePath('/cron');
    return { ok: true, message: `ok: job ${r.jobId}` };
  } catch (e) {
    return { ok: false, message: `error: ${(e as Error).message}` };
  }
}

export default async function Cron() {
  let schedulers: Scheduler[] | null = null;
  try {
    schedulers = await adminGet<Scheduler[]>('/admin/cron');
  } catch (e) {
    return (
      <>
        <h1>Cron</h1>
        <p className="error">Scheduler data unavailable (Redis down?): {(e as Error).message}</p>
        <p>Inbox pages (Customers, Ingests, Logs) keep working.</p>
      </>
    );
  }
  return (
    <>
      <h1>Cron</h1>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>pattern</th>
            <th>tz</th>
            <th>last result</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {schedulers.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>{s.pattern}</td>
              <td>{s.tz}</td>
              <td>
                <pre>{s.lastResult ? JSON.stringify(s.lastResult) : '—'}</pre>
              </td>
              <td>
                <TriggerButton name={s.name} action={triggerAction.bind(null, s.name)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
