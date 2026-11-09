'use client';

import { useState } from 'react';

type Act = () => Promise<{ ok: boolean; message: string }>;

function useFeedback() {
  const [msg, setMsg] = useState<string | null>(null);
  const run = async (act: Act) => {
    setMsg('working…');
    setMsg((await act()).message);
  };
  const note = msg ? (
    <small className={msg.startsWith('ok') ? 'ok' : 'error'}>{msg}</small>
  ) : null;
  return { run, note };
}

export function RequeueAllButton({ action }: { action: Act }) {
  const { run, note } = useFeedback();
  return (
    <span>
      <button onClick={() => run(action)}>Requeue all failed</button> {note}
    </span>
  );
}

export function RequeueOneButton({ action }: { action: Act }) {
  const { run, note } = useFeedback();
  return (
    <span>
      <button onClick={() => run(action)}>Requeue</button> {note}
    </span>
  );
}
