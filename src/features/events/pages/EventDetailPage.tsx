import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import {
  EventForm,
  type EventFormValues,
} from '@/features/events/components/EventForm';
import { EventRegistrationsManager } from '@/features/events/components/EventRegistrationsManager';
import { eventService } from '@/features/events/services/eventService';
import type { Event, EventRegistrationWithPerson } from '@/features/events/types';
import { formatDateTime } from '@/lib/utils';

const toDateInput = (isoDate: string) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInput = (isoDate: string) => {
  const date = new Date(isoDate);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const EventDetailPage = () => {
  const { eventId = '' } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistrationWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [sending, setSending] = useState(false);
  const registrationsLocked =
    event?.status === 'full' ||
    event?.status === 'completed' ||
    event?.status === 'cancelled';
  const canCloseRegistrations = event?.status === 'published';

  const acceptedCount = useMemo(
    () => registrations.filter((registration) => registration.status === 'accepted').length,
    [registrations],
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [eventResult, registrationsResult] = await Promise.all([
        eventService.getEventById(eventId),
        eventService.getEventRegistrations(eventId),
      ]);

      if (!eventResult) {
        setError('No se encontró el evento solicitado.');
        return;
      }

      setEvent(eventResult);
      setRegistrations(registrationsResult);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Error al cargar el evento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [eventId]);

  const handleUpdateEvent = async (values: EventFormValues) => {
    if (!event) return;

    try {
      const scheduledAt = new Date(`${values.date}T${values.time}:00`).toISOString();

      const updated = await eventService.updateEvent(event.id, {
        title: values.title,
        description: values.description,
        type: values.type,
        scheduledAt,
        location: values.location,
        zone: values.zone,
        address: values.address,
        maxSpots: Number(values.maxSpots),
        price: values.price,
        status: values.status,
        imageUrl: values.imageUrl,
        internalNotes: values.internalNotes,
      });

      setEvent(updated);
      setMessage('Cambios del evento guardados correctamente.');
    } catch (updateError) {
      setMessage(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudieron guardar los cambios del evento.',
      );
    }
  };

  const handleAcceptedChange = async (personIds: string[]) => {
    if (!event) return;

    try {
      const updatedRegistrations = await eventService.updateAcceptedPeople(event.id, personIds);
      setRegistrations(updatedRegistrations);
      setMessage('Selección de personas aceptadas guardada correctamente.');
    } catch (acceptedError) {
      const message =
        acceptedError instanceof Error
          ? acceptedError.message
          : 'No se pudo actualizar la selección de aceptados.';
      setMessage(message);
      throw acceptedError;
    }
  };

  const handleRejectByAffinity = async (personId: string) => {
    if (!event) return;

    try {
      const updatedRegistrations = await eventService.rejectPersonByAffinity(
        event.id,
        personId,
      );
      setRegistrations(updatedRegistrations);
      setMessage('Persona rechazada por afinidad correctamente.');
    } catch (rejectError) {
      const message =
        rejectError instanceof Error
          ? rejectError.message
          : 'No se pudo rechazar a la persona por afinidad.';
      setMessage(message);
      throw rejectError;
    }
  };

  const handleCloseRegistrations = async () => {
    if (!event) return;

    setClosing(true);
    try {
      const updated = await eventService.closeRegistrations(event.id);
      setEvent(updated);
      setMessage('Inscripciones cerradas correctamente.');
    } finally {
      setClosing(false);
      setConfirmCloseOpen(false);
    }
  };

  const handleSendEmails = async () => {
    if (!event) return;

    setSending(true);
    try {
      const result = await eventService.sendEmailToAcceptedPeople(event.id);
      setMessage(`Correo enviado a ${result.recipients} personas aceptadas.`);
    } finally {
      setSending(false);
      setConfirmEmailOpen(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center gap-2">
        <Spinner />
        <p className="text-sm text-mute">Cargando detalle del evento...</p>
      </Card>
    );
  }

  if (error || !event) {
    return (
      <Card>
        <p className="text-sm text-rose-700">{error ?? 'No se pudo cargar el evento.'}</p>
      </Card>
    );
  }

  return (
    <section className="grid gap-5">
      <Card className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{event.title}</h2>
        <p className="text-sm text-slate-600">Fecha programada: {formatDateTime(event.scheduledAt)}</p>
        <p className="text-sm text-slate-600">Estado actual: {event.status}</p>
      </Card>

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <Card>
        <h3 className="mb-3 text-base font-semibold text-ink">Información editable del evento</h3>
        <EventForm
          submitText="Guardar cambios"
          onSubmit={handleUpdateEvent}
          initialValues={{
            title: event.title,
            description: event.description,
            type: event.type,
            date: toDateInput(event.scheduledAt),
            time: toTimeInput(event.scheduledAt),
            location: event.location,
            zone: event.zone,
            address: event.address,
            maxSpots: event.maxSpots,
            price: event.price,
            status: event.status,
            imageUrl: event.imageUrl,
            internalNotes: event.internalNotes,
          }}
        />
      </Card>

      <EventRegistrationsManager
        registrations={registrations}
        maxSpots={event.maxSpots}
        eventClosed={Boolean(registrationsLocked)}
        onAcceptedChange={handleAcceptedChange}
        onRejectByAffinity={handleRejectByAffinity}
      />

      <Card className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-ink">Acciones finales</h3>
          <p className="text-sm text-slate-600">
            Cierra inscripciones o comunica la selección a las personas aceptadas.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <Button
            variant="secondary"
            onClick={() => setConfirmCloseOpen(true)}
            disabled={!canCloseRegistrations}
          >
            Cerrar inscripciones
          </Button>
          <Button
            onClick={() => setConfirmEmailOpen(true)}
            disabled={acceptedCount === 0}
          >
            Enviar correo a aceptados ({acceptedCount})
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmCloseOpen}
        title="Cerrar inscripciones"
        description="Esta acción cambiará el estado a cerrado y bloqueará nuevas inscripciones."
        confirmText="Cerrar inscripciones"
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={handleCloseRegistrations}
        loading={closing}
      />

      <ConfirmDialog
        open={confirmEmailOpen}
        title="Enviar correo a aceptados"
        description={`Se enviará una notificación a ${acceptedCount} personas aceptadas.`}
        confirmText="Enviar correo"
        onCancel={() => setConfirmEmailOpen(false)}
        onConfirm={handleSendEmails}
        loading={sending}
      />
    </section>
  );
};
