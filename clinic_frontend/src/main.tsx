import React from 'react';
import ReactDOM from 'react-dom/client';
import { router } from './router';
import { RouterProvider } from 'react-router';
import './index.css';
import { Toaster } from 'sonner';
import { GlobalConfirmModal } from './components/common/GlobalConfirmModal';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
      <GlobalConfirmModal />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
