/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { ClerkProvider } from '@clerk/clerk-react'
import { dark, light } from "@clerk/themes"
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function AppWithTheme() {
  const { theme } = useTheme()
  const clerkTheme = theme === 'dark' ? dark : light

  return (
    <ClerkProvider appearance={{ baseTheme: clerkTheme }} publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </React.StrictMode>,
)