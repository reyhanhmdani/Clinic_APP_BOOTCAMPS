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
import { RegisterPage } from './pages/auth/RegisterPage';
import { CustomerPage } from './pages/customers/CustomerPage';
import { PublicRoute } from './components/common/PublicRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/customers',
    element: (
      <ProtectedRoute allowedRoles={['CUSTOMER']}>
        <CustomerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
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
