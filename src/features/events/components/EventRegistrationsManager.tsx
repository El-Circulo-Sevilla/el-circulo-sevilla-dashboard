import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { EventRegistrationWithPerson } from '@/features/events/types';
import { DraggablePersonCard } from '@/features/events/components/DraggablePersonCard';
import { DroppablePersonList } from '@/features/events/components/DroppablePersonList';

interface EventRegistrationsManagerProps {
  registrations: EventRegistrationWithPerson[];
  maxSpots: number;
  eventClosed: boolean;
  onAcceptedChange: (personIds: string[]) => Promise<void>;
}

const REGISTERED_LIST_ID = 'registered-list';
const ACCEPTED_LIST_ID = 'accepted-list';

export const EventRegistrationsManager = ({
  registrations,
  maxSpots,
  eventClosed,
  onAcceptedChange,
}: EventRegistrationsManagerProps) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const accepted = useMemo(
    () => registrations.filter((registration) => registration.status === 'accepted'),
    [registrations],
  );

  const registered = useMemo(
    () => registrations.filter((registration) => registration.status === 'registered'),
    [registrations],
  );

  const syncAccepted = async (personIds: string[]) => {
    setSaving(true);
    try {
      await onAcceptedChange(personIds);
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setWarning(null);

    if (eventClosed) {
      setWarning('El evento está cerrado y ya no permite cambios de inscripción.');
      return;
    }

    const { active, over } = event;
    if (!over) return;

    const personId = String(active.id);
    const fromAccepted = accepted.some((item) => item.personId === personId);
    const targetListId = String(over.id);

    if (targetListId === ACCEPTED_LIST_ID && !fromAccepted) {
      if (accepted.length >= maxSpots) {
        setWarning('No puedes aceptar más personas que el máximo de plazas.');
        return;
      }

      const nextAccepted = [...accepted.map((item) => item.personId), personId];
      await syncAccepted(nextAccepted);
      return;
    }

    if (targetListId === REGISTERED_LIST_ID && fromAccepted) {
      const nextAccepted = accepted
        .map((item) => item.personId)
        .filter((id) => id !== personId);
      await syncAccepted(nextAccepted);
    }
  };

  return (
    <Card className="grid gap-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-bold text-ink">Gestión de inscritos</h2>
        <p className="text-sm text-mute">
          Inscritos: {registered.length} | Aceptados: {accepted.length} / {maxSpots} plazas
        </p>
      </div>

      {warning ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {warning}
        </div>
      ) : null}

      {saving ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
          Guardando selección...
        </div>
      ) : null}

      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-2">
          <DroppablePersonList
            id={REGISTERED_LIST_ID}
            title="Personas inscritas"
            subtitle="Pendientes de aceptación"
          >
            {registered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-brand-300 bg-white p-3 text-sm text-mute">
                No hay personas pendientes.
              </p>
            ) : (
              registered.map((registration) => (
                <DraggablePersonCard
                  key={registration.id}
                  id={registration.personId}
                  name={registration.person.name}
                  email={registration.person.email}
                  age={registration.person.age}
                  interests={registration.person.interests}
                  compatibilityScore={registration.compatibilityScore}
                  attendanceStatus={registration.status}
                  disabled={eventClosed}
                />
              ))
            )}
          </DroppablePersonList>

          <DroppablePersonList
            id={ACCEPTED_LIST_ID}
            title="Personas aceptadas"
            subtitle="Asistentes confirmados"
          >
            {accepted.length === 0 ? (
              <p className="rounded-xl border border-dashed border-brand-300 bg-white p-3 text-sm text-mute">
                Arrastra personas aquí para aceptarlas.
              </p>
            ) : (
              accepted.map((registration) => (
                <DraggablePersonCard
                  key={registration.id}
                  id={registration.personId}
                  name={registration.person.name}
                  email={registration.person.email}
                  age={registration.person.age}
                  interests={registration.person.interests}
                  compatibilityScore={registration.compatibilityScore}
                  attendanceStatus={registration.status}
                  disabled={eventClosed}
                />
              ))
            )}
          </DroppablePersonList>
        </div>
      </DndContext>
    </Card>
  );
};
