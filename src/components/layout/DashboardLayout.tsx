import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export const DashboardLayout = () => (
  <div className="min-h-screen bg-canvas md:flex">
    <Sidebar />
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <main className="flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  </div>
);
