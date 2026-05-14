import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { useThemeStore } from './state/themeStore.js'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

// Initialize theme before rendering
useThemeStore.getState().hydrate();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
