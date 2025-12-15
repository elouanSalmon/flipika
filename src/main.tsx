import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.tsx'
import { DemoModeProvider } from './contexts/DemoModeContext'
import { initGA4 } from './utils/ga4'

// Initialize Google Analytics 4
initGA4();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoModeProvider>
        <App />
      </DemoModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
