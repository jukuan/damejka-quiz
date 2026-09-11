# Дамейка — multilingual PWA quiz

React + Vite quiz game for school students, dedicated to Ignat Domeyko.

## Languages

The interface supports:

- 🇧🇾 Belarusian
- 🇬🇧 English
- 🇷🇺 Russian
- 🇪🇸 Spanish
- 🇩🇪 German
- 🇺🇦 Ukrainian

Translations are kept in `src/i18n.js`, and category labels are localized in `src/data/categoryNames.js`. The quiz data remains centralized in `src/data/questions.js`, so question-bank localization can be extended without changing game logic.

## PWA

The project is installable as a Progressive Web App:

- `public/manifest.webmanifest` contains the app manifest.
- `public/sw.js` provides offline caching and network-first HTML updates.
- `public/icons/` contains install icons.
- `src/pwa.js` registers the service worker.
- Chromium browsers expose an **Install** button when the browser makes the app-install prompt available.
- On iOS/iPadOS, Safari uses its normal **Share → Add to Home Screen** flow.

For PWA installation, serve the production build over HTTPS (localhost is also supported for development).

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Structure

- `src/App.jsx` — game state and orchestration
- `src/components/` — UI components
- `src/data/questions.js` — quiz questions
- `src/data/categoryNames.js` — localized category names
- `src/i18n.js` — interface translations
- `public/manifest.webmanifest` — PWA manifest
- `public/sw.js` — service worker
