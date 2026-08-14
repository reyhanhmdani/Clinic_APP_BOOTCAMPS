import { createBrowserRouter } from 'react-router';
import { Layout } from './components/common/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { InvoicePage } from './pages/InvoicePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
    ],
  },
]);
