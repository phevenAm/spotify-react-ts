import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTokenFromFragment } from './services/tokenStore'

// Parse the access_token from the URL fragment immediately, before
// the first render, so any component that checks isLoggedIn() sees
// the correct state right away.
initTokenFromFragment()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
