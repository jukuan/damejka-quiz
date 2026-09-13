import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) return

  Sentry.init({
    dsn,
    enabled: import.meta.env.PROD,
    environment: import.meta.env.MODE || 'production',
    release: import.meta.env.VITE_APP_VERSION || undefined,

    dataCollection: {
      userInfo: false,
      httpBodies: [], // don't collect request/response bodies
    },

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    tracesSampleRate: 0.1,

    // Session Replay: 1% of sessions, but 100% of sessions that had an error.
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
  })
}

export { Sentry }
