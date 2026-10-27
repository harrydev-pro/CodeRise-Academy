
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import App from './App.jsx'
import { AppProvider } from './providers.jsx'

import "../styles/global.css"
import "../styles/variables.css"
import "../styles/components.css"
import "../styles/responsive.css"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
