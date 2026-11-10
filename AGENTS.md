## Agent skills

### Issue tracker

Local markdown tracker under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.

## Dev servers (port hygiene)

Fixed ports: `3000` dashboard, `3001` api, `3002` docs (`@sim/docs`).

- The user runs `pnpm dev` manually. Agents must NOT leave servers running.
- After starting any server to test (dev or start), kill it when verification
  is done and confirm the port is free before finishing.
- Kill by port (`fuser -k <port>/tcp`), never by broad `pkill -f` patterns —
  a pattern matching your own shell command kills your own session.
- Never mix `next dev` and `next start` on the same app without deleting
  `.next` first; stale production chunks break the dev server
  (`cannot find module <n>.js`).
