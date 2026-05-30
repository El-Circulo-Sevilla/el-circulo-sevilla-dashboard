import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/features/events/components/EventCard';
import { eventService } from '@/features/events/services/eventService';
import type { Event, EventRegistrationWithPerson } from '@/features/events/types';

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsByEvent, setRegistrationsByEvent] = useState<
    Record<string, EventRegistrationWithPerson[]>
  >({});
  const [loading, setLoading] = useState(true);

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

  const totalOpen = useMemo(
    () => events.filter((event) => event.status === 'open').length,
    [events],
  );

  return (
    <section className="grid gap-5">
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Eventos actuales</h2>
          <p className="text-sm text-mute">
            {events.length} eventos totales · {totalOpen} abiertos
          </p>
        </div>

        <Link to="/dashboard/eventos/nuevo">
          <Button>+ Crear nuevo evento</Button>
        </Link>
      </Card>

      {loading ? (
        <Card>
          <p className="text-sm text-slate-600">Cargando eventos...</p>
        </Card>
      ) : null}

      {!loading && events.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No hay eventos creados todavía.</p>
        </Card>
      ) : null}

      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
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
      ) : null}
    </section>
  );
};
