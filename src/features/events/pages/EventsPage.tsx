import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, CheckCircle2, Clock3, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/features/events/components/EventCard';
import { eventService } from '@/features/events/services/eventService';
import type { Event, EventRegistrationWithPerson, EventStatus } from '@/features/events/types';
import { Spinner } from '@/components/ui/Spinner';

const statusFilters: Array<{ value: 'all' | EventStatus; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'full', label: 'Completos' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' },
];

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsByEvent, setRegistrationsByEvent] = useState<
    Record<string, EventRegistrationWithPerson[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);

      const entries = await Promise.all(
        data.map(async (event) => {
          const registrations = await eventService.getEventRegistrations(event.id);
          return [event.id, registrations] as const;
        }),
      );

      setRegistrationsByEvent(Object.fromEntries(entries));
      setLoading(false);
    };

    void load();
  }, []);

  const metrics = useMemo(() => {
    const totalPublished = events.filter(
      (event) => event.status === 'published',
    ).length;
    const totalRegistered = Object.values(registrationsByEvent).reduce(
      (acc, registrations) => acc + registrations.length,
      0,
    );
    const totalAccepted = Object.values(registrationsByEvent).reduce(
      (acc, registrations) =>
        acc + registrations.filter((registration) => registration.status === 'accepted').length,
      0,
    );
    const totalSpots = events.reduce((acc, event) => acc + event.maxSpots, 0);
    const occupationRate = totalSpots > 0 ? Math.round((totalAccepted / totalSpots) * 100) : 0;

    return {
      totalRegistered,
      totalAccepted,
      occupationRate,
      totalPublished,
    };
  }, [events, registrationsByEvent]);

  const filteredEvents = useMemo(
    () => events.filter((event) => (statusFilter === 'all' ? true : event.status === statusFilter)),
    [events, statusFilter],
  );

  const pendingActions = useMemo(
    () =>
      events.filter((event) => {
        const acceptedCount = (registrationsByEvent[event.id] ?? []).filter(
          (registration) => registration.status === 'accepted',
        ).length;

        return event.status === 'published' && acceptedCount < event.maxSpots;
      }).length,
    [events, registrationsByEvent],
  );

  return (
    <section className="grid gap-5">
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">Eventos actuales</h2>
          <p className="text-sm text-mute">Controla plazas, aceptación y seguimiento operativo.</p>
        </div>

        <Link to="/dashboard/eventos/nuevo">
          <Button>+ Crear nuevo evento</Button>
        </Link>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mute">Eventos publicados</p>
            <p className="mt-1 text-2xl font-bold text-ink">{metrics.totalPublished}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
            <CalendarCheck2 size={20} />
          </span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mute">Inscripciones</p>
            <p className="mt-1 text-2xl font-bold text-ink">{metrics.totalRegistered}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
            <UsersRound size={20} />
          </span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mute">Aceptados</p>
            <p className="mt-1 text-2xl font-bold text-ink">{metrics.totalAccepted}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={20} />
          </span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mute">Ocupación</p>
            <p className="mt-1 text-2xl font-bold text-ink">{metrics.occupationRate}%</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Clock3 size={20} />
          </span>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-xl border px-3 py-1.5 text-sm transition-all ${
              statusFilter === filter.value
                ? 'border-brand-400 bg-brand-100 font-semibold text-brand-900'
                : 'border-brand-200 bg-white text-dark-400 hover:border-brand-300 hover:bg-brand-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </Card>

      {loading ? (
        <Card className="flex items-center gap-2">
          <Spinner />
          <p className="text-sm text-mute">Cargando eventos...</p>
        </Card>
      ) : null}

      {!loading && filteredEvents.length === 0 ? (
        <Card>
          <p className="text-sm text-mute">No hay eventos para este filtro.</p>
          <div className="mt-3">
            <Link to="/dashboard/eventos/nuevo">
              <Button size="sm">Crear primer evento</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {!loading ? (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event) => {
              const registrations = registrationsByEvent[event.id] ?? [];
              const acceptedCount = registrations.filter(
                (registration) => registration.status === 'accepted',
              ).length;

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  registeredCount={registrations.length}
                  acceptedCount={acceptedCount}
                />
              );
            })}
          </div>

          <div className="grid h-fit gap-4">
            <Card className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">Estado de perfil y afinidad</h3>
              <p className="text-sm text-mute">
                Perfiles activos conectados con eventos publicados y cupo disponible.
              </p>
              <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900">
                Operativa estable. Mantén revisión semanal de perfiles pendientes.
              </div>
            </Card>

            <Card className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">Acciones pendientes</h3>
              <p className="text-sm text-mute">
                {pendingActions} eventos publicados necesitan completar selección.
              </p>
              <Link to="/dashboard/eventos">
                <Button variant="secondary" size="sm" className="w-full">
                  Revisar agenda operativa
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      ) : null}
    </section>
  );
};
