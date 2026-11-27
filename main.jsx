
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
import "./src/styles/community.css"
import "./src/styles/community-premium.css"
import "./src/styles/community-competitions.css"
import "./src/styles/community-hackathons.css"
import "./src/styles/community-admin-review.css"
import "./src/styles/community-projects.css"
import "./src/styles/community-admin-events.css"
import "./src/styles/community-teams.css"
import "./src/styles/community-admin-manage.css"
import "./src/styles/theme-colors.css"
import "./src/styles/theme.css"
import "./src/features/theme/theme.js"

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
