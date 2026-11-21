
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import App from './App.jsx'
import { AppProvider } from './src/store/providers.jsx'
import PWAInstallPrompt from './src/components/layout/PWAInstallPrompt.jsx'

import "./src/styles/global.css"
import "./src/styles/variables.css"
import "./src/styles/components.css"
import "./src/styles/responsive.css"
import "./src/styles/app.css"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <PWAInstallPrompt />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('CodeRise offline support could not be enabled:', error)
    })
  }, { once: true })
}
