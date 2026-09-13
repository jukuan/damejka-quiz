import React from 'react'
import ReactDOM from 'react-dom/client'
import { initSentry, Sentry } from './sentry'
import App from './App'
import './index.css'

// 1. Sentry must be initialized before anything else that might throw.
initSentry()

// 2. Use a Sentry-instrumented root when available, otherwise fall back to
//    the plain React 18 root. Sentry.createRoot is optional — it only adds
//    component-tree attribution to errors, which ErrorBoundary handles too.
const container = document.getElementById('root')

const root = Sentry.createRoot
  ? Sentry.createRoot(container)
  : ReactDOM.createRoot(container)

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h1>Нешта пайшло не так</h1>
          <p>Паспрабуйце перазагрузіць старонку.</p>
          <button onClick={resetError}>Перазагрузіць</button>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
