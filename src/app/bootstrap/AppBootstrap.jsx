import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppProviders from '../providers/AppProviders';
import AppRouter from '../router/AppRouter';

export default function AppBootstrap() {
  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}
