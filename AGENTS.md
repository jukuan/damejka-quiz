# AGENTS.md — Дамейка

- React 18+ / Vite.
- UI supports Belarusian, English, Russian, Spanish, German, and Ukrainian via `src/i18n.js`.
- All question data belongs in `src/data/questions.js`; localized category labels are in `src/data/categoryNames.js`.
- UI is split into small components; `App.jsx` owns game state/orchestration.
- Difficulty selection starts the game immediately; there is no round-selection screen.
- Each round attempts every category with questions for the selected difficulty.
- A correct normal question completes its category.
- A double question requires both parts to be correct; a wrong first part does not complete the category.
- Wrong answers advance to another category without removing the current category.
- Every answer attempt increments either the correct or incorrect score for the current round.
- A correct first part of a double question counts as one correct answer; the follow-up is a second answer and is counted separately.
- MCQ answers are checked immediately when an option is clicked. There is no `Праверыць адказ` button for MCQ.
- `Праверыць адказ` remains only for `unscramble` questions.
- If the last remaining category is answered incorrectly, the round still ends after the feedback delay.
- Questions may repeat between rounds; no repeats are allowed/needed within a round because each category is attempted once.
- Keep React hooks unconditional.
- No runtime dependencies beyond React/ReactDOM.
- Use `npm install`, `npm run dev`, and `npm run build` to verify.

- PWA assets live in `public/manifest.webmanifest`, `public/sw.js`, and `public/icons/`.
- Register the service worker from `src/pwa.js`; keep navigation network-first so new deployments are picked up.
- The install button uses `beforeinstallprompt` where supported; iOS installation remains available through Safari's Add to Home Screen action.
