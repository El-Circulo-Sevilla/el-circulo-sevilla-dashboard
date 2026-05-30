import { Navigate, createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  {
    path: '*',
    element: <Navigate to="/dashboard/eventos" replace />,
  },
]);
