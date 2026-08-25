# Continuity

[PLANS]
- 2026-08-21T00:00:00-04:00 [USER] Build an "AI gf" style app. Interpret as a local AI companion chat web app with respectful/healthy boundaries and optional model integration.
- 2026-08-21T14:40:00-04:00 [USER] Pivot project to an AI dating simulator with multiple characters, custom character configs, and custom events.
- 2026-08-25T00:00:00-04:00 [USER] Pivot back to a focused AI girlfriend/companion chat while keeping Ollama integration.

[DECISIONS]
- 2026-08-21T14:18:00-04:00 [CODE] Added self-hosted LLM path using an OpenAI-compatible `/api/chat` server route. Defaults: `LOCAL_LLM_BASE_URL=http://localhost:11434/v1`, `LOCAL_LLM_MODEL=llama3.1:8b`, `LOCAL_LLM_API_KEY=ollama`.
- 2026-08-21T14:40:00-04:00 [CODE] Reworked app into "Route Studio": multiple preset characters, browser-persisted custom characters, per-character custom events, route stats, scripted choices, and freeform Ollama-backed replies.
- 2026-08-21T14:52:00-04:00 [USER] User requested removing premade chat options; gameplay should focus entirely on text input. [CODE] Removed event choice data, choice buttons, and choice handler; events now only set scene context/opening line.
- 2026-08-25T00:00:00-04:00 [CODE] Simplified app back to single-companion "Mira" chat. Kept `/api/chat` Ollama integration, editable personality/boundaries, mood controls, local memories, and fallback replies.
- 2026-08-25T00:00:00-04:00 [USER] Treat `.agent` working notes as private. [CODE] Added `/.agent/` to `.gitignore` to prevent future uploads.

[PROGRESS]
- 2026-08-21T13:13:00-04:00 [USER] User instructed: "don't publish to git"; publishing path stopped. Prior push attempts failed with 403 and no source was published.
- 2026-08-25T00:00:00-04:00 [TOOL] `.agent/CONTINUITY.md` remains in commit `c6af7dc`; deleting the current GitHub file did not purge history. Automated rewrite was blocked by workspace `.git` ACLs.

[DISCOVERIES]
- 2026-08-21T13:13:00-04:00 [TOOL] Local app passed `npm run lint` and `npm run build`; dev server is running at http://localhost:3000/.
- 2026-08-21T14:18:00-04:00 [TOOL] After self-hosted adapter changes, `npm run lint` and `npm run build` passed. `/api/chat` returns a controlled 502 JSON error when Ollama/local model is unavailable.
- 2026-08-21T14:40:00-04:00 [TOOL] After dating-sim pivot, `npm run lint` and `npm run build` passed.
- 2026-08-21T14:52:00-04:00 [TOOL] After text-input-only change, `npm run lint` and `npm run build` passed.
- 2026-08-25T00:00:00-04:00 [TOOL] After pivot back to focused AI companion chat, `npm run lint` and `npm run build` passed.

[OUTCOMES]
