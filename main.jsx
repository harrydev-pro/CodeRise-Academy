
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import App from './App.jsx'
import { AppProvider } from './src/store/providers.jsx'

import "./src/styles/global.css"
import "./src/styles/variables.css"
import "./src/styles/components.css"
import "./src/styles/responsive.css"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
