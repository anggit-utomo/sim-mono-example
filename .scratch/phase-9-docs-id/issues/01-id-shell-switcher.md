# 01: Indonesian shell with ID|EN switcher

**What to build:** The docs app gains an Indonesian route tree whose shell mirrors the English one, with a language switcher that always points at the same page in the other language.

**Blocked by:** None (can start immediately).

**Status:** superseded

- [ ] Indonesian overview route renders the docs shell with Indonesian intro text
- [ ] Every English page links to its Indonesian counterpart and every Indonesian page links back
- [ ] Switcher resolves correctly on all routes including unknown future pages (prefix-based, not hardcoded per page)
- [ ] Build, typecheck, and lint placeholder pass with both trees present

**Superseded:** Superseded by the single-URL toggle design: no shell tree, no switcher links; locale provider + ID|EN toggle instead. Do not implement as written.
