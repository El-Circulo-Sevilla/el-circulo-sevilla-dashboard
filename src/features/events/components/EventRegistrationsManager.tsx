import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { EventRegistrationWithPerson } from '@/features/events/types';
import { DraggablePersonCard } from '@/features/events/components/DraggablePersonCard';
import { DroppablePersonList } from '@/features/events/components/DroppablePersonList';

interface EventRegistrationsManagerProps {
  registrations: EventRegistrationWithPerson[];
  maxSpots: number;
  eventClosed: boolean;
  onAcceptedChange: (personIds: string[]) => Promise<void>;
  onRejectByAffinity: (personId: string) => Promise<void>;
}

const REGISTERED_LIST_ID = 'registered-list';
const ACCEPTED_LIST_ID = 'accepted-list';

export const EventRegistrationsManager = ({
  registrations,
  maxSpots,
  eventClosed,
  onAcceptedChange,
  onRejectByAffinity,
}: EventRegistrationsManagerProps) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rejectingPersonId, setRejectingPersonId] = useState<string | null>(null);
  const [draftAcceptedIds, setDraftAcceptedIds] = useState<string[]>([]);

  const candidates = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === 'registered' || registration.status === 'accepted',
      ),
    [registrations],
  );

  const persistedAcceptedIds = useMemo(
    () =>
      candidates
        .filter((registration) => registration.status === 'accepted')
        .map((registration) => registration.personId),
    [candidates],
  );

  useEffect(() => {
    setDraftAcceptedIds(persistedAcceptedIds);
  }, [persistedAcceptedIds.join('|')]);

  const hasPendingChanges = useMemo(() => {
    const persisted = [...persistedAcceptedIds].sort().join('|');
    const draft = [...draftAcceptedIds].sort().join('|');
    return persisted !== draft;
  }, [persistedAcceptedIds, draftAcceptedIds]);

  const accepted = useMemo(
    () =>
      candidates.filter((registration) =>
        draftAcceptedIds.includes(registration.personId),
      ),
    [candidates, draftAcceptedIds],
  );

  const registered = useMemo(
    () =>
      candidates.filter(
        (registration) => !draftAcceptedIds.includes(registration.personId),
      ),
    [candidates, draftAcceptedIds],
  );

  const syncAccepted = async (personIds: string[]) => {
    setSaving(true);
    try {
      await onAcceptedChange(personIds);
      setWarning(null);
    } catch {
      setWarning(
        'No se pudieron guardar los cambios. Revisa la conexión o permisos y reintenta.',
      );
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

      const nextAccepted = [...draftAcceptedIds, personId];
      setDraftAcceptedIds(nextAccepted);
      return;
    }

    if (targetListId === REGISTERED_LIST_ID && fromAccepted) {
      const nextAccepted = draftAcceptedIds
        .filter((id) => id !== personId);
      setDraftAcceptedIds(nextAccepted);
    }
  };

  const rejectPerson = async (personId: string) => {
    if (eventClosed) {
      setWarning('El evento está cerrado y no permite rechazos manuales.');
      return;
    }

    if (hasPendingChanges) {
      setWarning(
        'Guarda o descarta los cambios pendientes de aceptados antes de rechazar por afinidad.',
      );
      return;
    }

    setWarning(null);
    setRejectingPersonId(personId);
    try {
      await onRejectByAffinity(personId);
      setDraftAcceptedIds((current) => current.filter((id) => id !== personId));
    } catch {
      setWarning('No se pudo rechazar a la persona por afinidad. Inténtalo de nuevo.');
    } finally {
      setRejectingPersonId(null);
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

      {hasPendingChanges && !saving ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
          Tienes cambios sin guardar en la selección de personas aceptadas.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => setDraftAcceptedIds(persistedAcceptedIds)}
          disabled={!hasPendingChanges || saving}
        >
          Descartar cambios
        </Button>
        <Button
          onClick={() => void syncAccepted(draftAcceptedIds)}
          disabled={!hasPendingChanges || saving || eventClosed}
          isLoading={saving}
        >
          Guardar cambios
        </Button>
      </div>

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
                  disabled={eventClosed || saving}
                  showRejectButton
                  rejectButtonDisabled={
                    eventClosed ||
                    saving ||
                    rejectingPersonId !== null ||
                    hasPendingChanges
                  }
                  onRejectByAffinity={() => void rejectPerson(registration.personId)}
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
                  disabled={eventClosed || saving}
                />
              ))
            )}
          </DroppablePersonList>
        </div>
      </DndContext>
    </Card>
  );
};
