import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/pdfStyles.css'
import './i18n'
import App from './App.tsx'

// Disable browser's automatic scroll restoration to prevent fighting with our custom logic
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

import { DemoModeProvider } from './contexts/DemoModeContext'
import { initGA4 } from './utils/ga4'

// Initialize Google Analytics 4
initGA4();

import { HelmetProvider } from 'react-helmet-async';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <DemoModeProvider>
          <App />
        </DemoModeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
