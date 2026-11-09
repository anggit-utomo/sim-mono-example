'use client';

import { useState } from 'react';

export function TriggerButton({
  name,
  action,
}: {
  name: string;
  action: () => Promise<{ ok: boolean; message: string }>;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span>
      <button
        onClick={async () => {
          if (!window.confirm(`Run ${name} now?`)) return;
          setMsg('triggering…');
          const r = await action();
          setMsg(r.message);
        }}
      >
        Trigger now
      </button>{' '}
      {msg && <small className={msg.startsWith('ok') ? 'ok' : 'error'}>{msg}</small>}
    </span>
  );
}
