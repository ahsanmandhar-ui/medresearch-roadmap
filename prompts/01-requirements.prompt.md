# OpenCode — Requirements Interview

Read:
- AGENTS.md
- docs/STATE.md
- docs/REQUIREMENTS.md

Do not write application code.

Find all production-blocking `NEEDS_USER_INPUT` and `UNDECIDED` items relevant to the current slice.

Ask the user only the minimum questions required.

If an answer can be safely deferred, explicitly record it as deferred rather than guessing.

After receiving answers:
- update REQUIREMENTS.md;
- update STATE.md;
- set the next slice;
- stop.
