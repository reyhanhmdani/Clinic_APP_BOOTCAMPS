import React from 'react';
import ReactDOM from 'react-dom/client';
import { router } from './router';
import { RouterProvider } from 'react-router';
import './index.css';
import { Toaster } from 'sonner';
import { GlobalConfirmModal } from './components/common/GlobalConfirmModal';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors closeButton />
    <GlobalConfirmModal />
  </React.StrictMode>,
);
