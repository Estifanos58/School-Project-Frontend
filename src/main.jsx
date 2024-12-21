import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/sonner"
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <>
    <SocketProvider>
      <App />
      <Toaster closeButton/>
    </SocketProvider>
    
  </>
  // </StrictMode>,
)
