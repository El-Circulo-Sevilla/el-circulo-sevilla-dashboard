import { CalendarDays, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { adminAuthService } from '@/features/auth/services/adminAuthService';
import { cn } from '@/lib/utils';

const navItems = [
  {
    to: '/dashboard/eventos',
    label: 'Eventos',
    icon: CalendarDays,
  },
  {
    to: '/dashboard/personas',
    label: 'Personas',
    icon: Users,
  },
];

export const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-full border-b border-brand-200/80 bg-white px-4 py-4 md:flex md:h-screen md:w-72 md:flex-col md:border-b-0 md:border-r md:px-5">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-brand-200 bg-brand-50">
          <img src="/logo.png" alt="El Círculo Sevilla" className="h-10 w-10 object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">El Círculo Sevilla</p>
          <p className="text-xs text-mute">Panel de administración</p>
        </div>
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'border-brand-300 bg-brand-100 text-brand-900'
                    : 'text-dark-400 hover:border-brand-200 hover:bg-brand-50 hover:text-ink',
                )
              }
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 md:mt-auto md:pt-4">
        <Button
          variant="secondary"
          className="w-full justify-center"
          onClick={() => {
            void adminAuthService.signOut();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
};
