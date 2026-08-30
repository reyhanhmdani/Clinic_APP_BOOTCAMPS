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
import { PublicRoute } from './components/common/PublicRoute';
import { RegisterPage } from './pages/auth/RegisterPage';
// Customer Portal Layout & Sub-Pages
import { CustomerLayout } from './layouts/CustomerLayout';
import { CustomerDashboardPage } from './pages/customers/CustomerDashboardPage';
import { CustomerHistoryPage } from './pages/customers/CustomerHistoryPage';
import { CustomerNotificationPage } from './pages/customers/CustomerNotificationPage';
import { CustomerProfilePage } from './pages/customers/CustomerProfilePage';

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
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CustomerDashboardPage />,
      },
      {
        path: 'history',
        element: <CustomerHistoryPage />,
      },
      {
        path: 'notifications',
        element: <CustomerNotificationPage />,
      },
      {
        path: 'profile',
        element: <CustomerProfilePage />,
      },
    ],
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
