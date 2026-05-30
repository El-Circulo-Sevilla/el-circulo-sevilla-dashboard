import { Bell, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const titleByPath = (pathname: string) => {
  if (pathname.includes('/personas')) return 'Personas';
  if (pathname.endsWith('/eventos/nuevo')) return 'Nuevo evento';
  if (pathname.includes('/eventos/')) return 'Detalle de evento';
  if (pathname.includes('/eventos')) return 'Eventos';
  return 'Dashboard';
};

export const Header = () => {
  const { pathname } = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 14 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <header className="sticky top-0 z-20 border-b border-brand-200/80 bg-canvas/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{greeting}</p>
          <h1 className="text-xl font-bold text-ink">{titleByPath(pathname)}</h1>
          <p className="text-sm text-mute">Gestión de personas, eventos e inscripciones</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-brand-200 bg-white px-3 py-2 md:flex">
            <Search size={16} className="text-dark-300" />
            <span className="text-sm text-dark-300">Búsqueda rápida</span>
          </div>
          <Link to="/dashboard/eventos/nuevo" className="hidden md:block">
            <Button size="sm">Nuevo evento</Button>
          </Link>
          <button className="rounded-xl border border-brand-200 bg-white p-2 text-dark-400 transition hover:border-brand-400 hover:bg-brand-50">
            <Bell size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
