import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { EventForm, type EventFormValues } from '@/features/events/components/EventForm';
import { eventService } from '@/features/events/services/eventService';

export const NewEventPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreateEvent = async (values: EventFormValues) => {
    setSaving(true);
    setError(null);
    try {
      const event = await eventService.createEvent({
        title: values.title,
        description: values.description,
        type: values.type,
        date: values.date,
        time: values.time,
        location: values.location,
        zone: values.zone,
        address: values.address,
        maxSpots: Number(values.maxSpots),
        price: values.price,
        status: values.status,
        imageUrl: values.imageUrl,
        internalNotes: values.internalNotes,
      });

      navigate(`/dashboard/eventos/${event.id}`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'No se pudo crear el evento.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-5">
      <Card>
        <h2 className="text-lg font-semibold text-ink">Crear nuevo evento</h2>
        <p className="mt-1 text-sm text-slate-600">
          Completa la información básica y publica cuando esté listo.
        </p>
      </Card>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Card>
        <EventForm
          submitText="Crear evento"
          onSubmit={handleCreateEvent}
          isSubmitting={saving}
          initialValues={{ status: 'draft' }}
        />
      </Card>
    </section>
  );
};
