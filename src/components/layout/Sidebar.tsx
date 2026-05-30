import { CalendarDays, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/dashboard/eventos",
    label: "Eventos",
    icon: CalendarDays,
  },
  {
    to: "/dashboard/personas",
    label: "Personas",
    icon: Users,
  },
];

export const Sidebar = () => (
  <aside className="w-full border-b border-slate-200 bg-white px-4 py-4 md:h-screen md:w-72 md:border-b-0 md:border-r md:px-5">
    <div className="mb-6 flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        <img
          src="/public/logo.png"
          alt="El Círculo Sevilla"
          className="h-10 w-10 object-cover"
        />
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
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accentSoft text-teal-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-ink",
              )
            }
          >
            <Icon size={16} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  </aside>
);

