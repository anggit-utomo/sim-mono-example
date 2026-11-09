'use client';

import { useState } from 'react';

export function RetryButton({ action }: { action: () => Promise<{ ok: boolean; message: string }> }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span>
      <button
        onClick={async () => {
          setMsg('retrying…');
          const r = await action();
          setMsg(r.message);
        }}
      >
        Retry
      </button>{' '}
      {msg && <small className={msg.startsWith('ok') ? 'ok' : 'error'}>{msg}</small>}
    </span>
  );
}
