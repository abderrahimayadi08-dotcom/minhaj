import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './store'
import App from './App'
import './styles.css'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/minhaj/">
    <StoreProvider>
      <App />
    </StoreProvider>
  </BrowserRouter>
)
