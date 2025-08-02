import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker for PWA support with update prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('Service worker registered:', reg);
        if (reg.waiting) {
          showRefreshPrompt();
        }
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showRefreshPrompt();
              }
            });
          }
        });
      })
      .catch(err => {
        console.error('Service worker registration failed:', err);
      });
  });
}

function showRefreshPrompt() {
  if (window.confirm('A new version is available. Refresh now to update?')) {
    window.location.reload();
  }
}
