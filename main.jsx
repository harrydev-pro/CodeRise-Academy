
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import App from './App.jsx'
import { AppProvider } from './src/store/providers.jsx'

import "./src/styles/global.css"
import "./src/styles/variables.css"
import "./src/styles/components.css"
import "./src/styles/responsive.css"
import "./src/styles/app.css"
import "./src/styles/theme-colors.css"
import "./src/styles/theme.css"
import "./src/features/theme/theme.js"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
