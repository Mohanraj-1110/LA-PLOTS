# AI Agent Instructions — LK Vetriinfra

Read this file first, every session, regardless of which AI tool you are
(Claude, ChatGPT, Copilot, Cursor, Gemini, etc). It exists to keep token
usage low and work consistent across tools.

## Project
Two React (Vite + TypeScript + Tailwind CSS) apps + one Firebase backend
(Auth, Firestore, Storage, Hosting, Cloud Functions). Full spec lives in
`LK_Vetriinfra_Full_Project_Blueprint.pdf` — do NOT re-read the whole PDF
every session. Only open the specific section named in PROJECT_STATUS.md
for the current phase (e.g. "Section 11, Prompt A3" for the Plots module).

- `packages/admin-app` — internal agent/admin app
- `packages/customer-app` — public customer app
- `packages/shared` — shared Firebase config, TS types, UI components
- `functions/` — Firebase Cloud Functions

## Session start checklist (do this before writing any code)
1. Open `PROJECT_STATUS.md` — find the first unchecked phase. That is your task.
2. Open `AI_LOG.md` — read only the **last entry** (not the whole file).
3. If the last entry says a phase is "in progress" or "blocked", continue
   that exact phase before starting a new one.
4. Do not ask the user to re-paste the project idea, tech stack, or page
   list — it is already in the PDF and in PROJECT_STATUS.md.

## Coding conventions (apply in every phase)
- TypeScript everywhere; one type per Firestore collection in
  `packages/shared/types/`.
- Tailwind CSS only — no separate CSS files except `index.css` (Tailwind
  directives).
- All Firestore/Storage calls go through `src/services/*.ts` — never call
  Firebase directly from a component.
- Every list/data view needs loading, empty, and error states.
- Every destructive action needs a confirm dialog + toast on success.
- Mobile-first: build the 360px layout first, then adapt up.
- Never commit Firebase API keys — use `.env` + `.env.example`.

## Session end checklist (do this before ending every session)
1. Check off the completed phase(s) in `PROJECT_STATUS.md`.
2. Append ONE new entry to `AI_LOG.md` using the template at the top of
   that file. Keep it short — bullet points, not prose.
3. If you stopped mid-phase, mark it "in progress" in both files and note
   exactly what's left, so the next agent doesn't redo finished work.

## Token-saving rule
Never paste the full blueprint PDF content into your own context or
output "for reference." Cite it by section number only
(e.g. "per Section 8 data model"). Never restate finished phases back to
the user — just say what changed this session.
