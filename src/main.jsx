import React from 'react'
import ReactDOM from 'react-dom/client'
import { initSentry, Sentry } from './sentry'
import App from './App'
import './index.css'

initSentry()

ReactDOM.createRoot(document.getElementById('root')).render(
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
