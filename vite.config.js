import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Modern browsers only — you don't need to transpile for IE11.
    target: 'es2022',

    // Give the chunks a bit of headroom before warning. Sentry's Replay
    // integration is ~380 kB on its own; that's expected, not a problem.
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendors so a code change in your app doesn't bust the
        // React/Sentry cache for returning users.
        manualChunks: {
          react: ['react', 'react-dom'],
          sentry: ['@sentry/react'],
        },
      },
    },
  },
})
