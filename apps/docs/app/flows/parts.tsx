// Shared presentational helpers for EN + ID flows pages.
import CopyButton from '../copy-button';

export function RunIt({ script }: { script: string }) {
  return (
    <>
      <div className="toolbar">
        <CopyButton text={script} />
      </div>
      <pre>{script}</pre>
    </>
  );
}

export function Lane({ children }: { children: string }) {
  return <span className="lane">{children}</span>;
}

export function Checks({ items, title = 'Where to check (dashboard :3000)' }: { items: string[]; title?: string }) {
  return (
    <>
      <h3>{title}</h3>
      <ol>
        {items.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ol>
    </>
  );
}
