# 01: Scaffold docs app shell and wiring

**What to build:** Docs app runs alongside the dashboard on its own port with mirrored nav, card and table styling, and footer; empty routes render the shell with no queue or database dependency.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Docs app starts on its own port while dashboard still starts on its port
- [ ] Top nav shows brand plus links for Overview, Customers, Queues, Cron, Ingests, Logs, Walkthrough, Troubleshooting
- [ ] Shared card, table, toolbar, and error styles match dashboard look with basic HTML and CSS only
- [ ] Footer links back to the real dashboard and names the canonical operator guide
- [ ] Build, typecheck, and lint placeholder pass with no queue or database env required
