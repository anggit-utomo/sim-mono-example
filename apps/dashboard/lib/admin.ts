// Server-side admin API client. ADMIN_TOKEN never leaves the server:
// this module is imported only by server components and server actions.
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

function headers() {
  return {
    Authorization: `Bearer ${process.env.ADMIN_TOKEN ?? ''}`,
    'Content-Type': 'application/json',
  };
}

export async function adminGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error(`admin GET ${path}: ${res.status}`);
  return (await res.json()) as T;
}

export async function adminPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`admin POST ${path}: ${res.status} ${text}`.trim());
  }
  return (await res.json()) as T;
}

export type Page<T> = { page: number; pageSize: number; total?: number; items: T[] };
