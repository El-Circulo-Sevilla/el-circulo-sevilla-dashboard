import { Navigate, createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RedirectIfAuthenticated, RequireAdmin } from '@/features/auth/components';
import { AuthCallbackPage, LoginPage, NoAutorizadoPage } from '@/features/auth/pages';
import { EventDetailPage } from '@/features/events/pages/EventDetailPage';
import { EventsPage } from '@/features/events/pages/EventsPage';
import { NewEventPage } from '@/features/events/pages/NewEventPage';
import { PeoplePage } from '@/features/people/pages/PeoplePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard/eventos" replace />,
  },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/no-autorizado',
    element: <NoAutorizadoPage />,
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="eventos" replace />,
          },
          {
            path: 'personas',
            element: <PeoplePage />,
          },
          {
            path: 'eventos',
            element: <EventsPage />,
          },
          {
            path: 'eventos/nuevo',
            element: <NewEventPage />,
          },
          {
            path: 'eventos/:eventId',
            element: <EventDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
