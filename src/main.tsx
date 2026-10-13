import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AutomatonProvider } from './context/AutomatonProvider'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <AutomatonProvider>
      <App />
    </AutomatonProvider>
  </StrictMode>,
)
