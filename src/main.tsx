import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n/index.ts'
import './index.css'
import App from './App.tsx'
import { runSanityChecks } from './utils/calculations'
import { runStrategyEngineTest } from './utils/strategyEngine'

if (import.meta.env.DEV) {
  runSanityChecks()
  runStrategyEngineTest()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
