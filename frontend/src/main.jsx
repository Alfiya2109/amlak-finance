import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// If this window is the MSAL popup window, let MSAL complete and close the popup automatically
if (window.opener && window.name && window.name.includes('msal')) {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-size:13px;font-weight:bold;color:#065f46;background:#f0fdf4;">✓ Verified! Closing Microsoft window...</div>';
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
