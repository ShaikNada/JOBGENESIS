import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PreferencesProvider } from './hooks/usePreferences';

// Use environment variable or fallback for config setup
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)