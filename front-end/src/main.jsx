import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" closeButton />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
