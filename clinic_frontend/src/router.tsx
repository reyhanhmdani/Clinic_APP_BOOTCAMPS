import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/common/Layout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ConsultationPage } from './pages/admin/ConsultationPage';
import { InvoicePage } from './pages/admin/InvoicePage';
import { LoginPage } from './pages/auth/LoginPage';
import { MedicinePage } from './pages/admin/MedicinePage';
import { PatientPage } from './pages/admin/PatientPage';
import { DoctorPage } from './pages/admin/DoctorPage';
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
        path: 'patients',
        element: <PatientPage />,
      },
      {
        path: 'doctors',
        element: <DoctorPage />,
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
