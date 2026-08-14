import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/common/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { InvoicePage } from './pages/InvoicePage';
import { LoginPage } from './pages/LoginPage';
import { MedicinePage } from './pages/MedicinePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'consultations',
        element: <ConsultationPage />,
      },
      {
        path: 'invoices',
        element: <InvoicePage />,
      },
      {
        path: 'medicines',
        element: <MedicinePage />,
      },
    ],
  },
]);
