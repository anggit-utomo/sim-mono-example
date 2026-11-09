import { adminGet, Page } from '../../lib/admin';

type Customer = {
  id: string;
  externalId: string;
  name: string;
  email: string;
  lastIngestAt: string;
};

export default async function Customers({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page = '1', q = '' } = await searchParams;
  const data = await adminGet<Page<Customer>>(
    `/admin/customers?page=${encodeURIComponent(page)}&q=${encodeURIComponent(q)}`,
  );
  const pages = Math.max(1, Math.ceil((data.total ?? 0) / data.pageSize));
  const prev = Math.max(1, data.page - 1);
  const next = Math.min(pages, data.page + 1);

  return (
    <>
      <h1>Customers</h1>
      <form className="toolbar" method="get">
        <input name="q" defaultValue={q} placeholder="exact externalId or email prefix" size={36} />
        <button type="submit">Search</button>
        <span>
          {data.total} total, page {data.page}/{pages}
        </span>
        <a href={`/customers?page=${prev}&q=${encodeURIComponent(q)}`}>Prev</a>
        <a href={`/customers?page=${next}&q=${encodeURIComponent(q)}`}>Next</a>
      </form>
      <table>
        <thead>
          <tr>
            <th>externalId</th>
            <th>name</th>
            <th>email</th>
            <th>lastIngestAt</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((c) => (
            <tr key={c.id}>
              <td>{c.externalId}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.lastIngestAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
