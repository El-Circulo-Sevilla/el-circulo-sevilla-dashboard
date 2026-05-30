import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titleByPath = (pathname: string) => {
  if (pathname.includes('/personas')) return 'Personas';
  if (pathname.endsWith('/eventos/nuevo')) return 'Nuevo evento';
  if (pathname.includes('/eventos/')) return 'Detalle de evento';
  if (pathname.includes('/eventos')) return 'Eventos';
  return 'Dashboard';
};

export const Header = () => {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-surface/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{titleByPath(pathname)}</h1>
          <p className="text-sm text-mute">Gestión de personas, eventos e inscripciones</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 md:flex">
            <Search size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400">Búsqueda rápida</span>
          </div>
          <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
            <Bell size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
