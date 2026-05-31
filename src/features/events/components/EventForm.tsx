import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { EventStatus } from '@/features/events/types';

const eventFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  type: z.string().min(1, 'El tipo es obligatorio'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  time: z.string().min(1, 'La hora es obligatoria'),
  location: z.string().min(1, 'El lugar es obligatorio'),
  zone: z.string().optional(),
  address: z.string().optional(),
  maxSpots: z.coerce.number().int().positive('Debe ser mayor que 0'),
  price: z
    .union([z.coerce.number().nonnegative('No puede ser negativo'), z.nan()])
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .optional(),
  status: z.enum(['draft', 'published', 'full', 'completed', 'cancelled']),
  imageUrl: z.string().optional(),
  internalNotes: z.string().optional(),
});

export type EventFormValues = z.input<typeof eventFormSchema>;

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  submitText?: string;
  isSubmitting?: boolean;
}

const defaultValues: EventFormValues = {
  title: '',
  description: '',
  type: 'Encuentro',
  date: '',
  time: '19:00',
  location: '',
  zone: '',
  address: '',
  maxSpots: 10,
  price: undefined,
  status: 'draft',
  imageUrl: '',
  internalNotes: '',
};

const statusOptions: Array<{ value: EventStatus; label: string }> = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'full', label: 'Completo' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const EventForm = ({
  initialValues,
  onSubmit,
  submitText = 'Guardar evento',
  isSubmitting = false,
}: EventFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  const loading = isSubmitting || formIsSubmitting;

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Título del evento" error={errors.title?.message} {...register('title')} />
        <Input label="Tipo de evento" error={errors.type?.message} {...register('type')} />
      </div>

      <Textarea
        label="Descripción"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input type="date" label="Fecha" error={errors.date?.message} {...register('date')} />
        <Input type="time" label="Hora" error={errors.time?.message} {...register('time')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Lugar" error={errors.location?.message} {...register('location')} />
        <Input label="Zona" error={errors.zone?.message} {...register('zone')} />
      </div>

      <Input label="Dirección" error={errors.address?.message} {...register('address')} />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="number"
          min={1}
          label="Número máximo de plazas"
          error={errors.maxSpots?.message}
          {...register('maxSpots')}
        />
        <Input
          type="number"
          min={0}
          step="0.01"
          label="Precio"
          error={errors.price?.message?.toString()}
          {...register('price')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Estado" error={errors.status?.message} {...register('status')}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input label="Imagen o icono (URL)" error={errors.imageUrl?.message} {...register('imageUrl')} />
      </div>

      <Textarea
        label="Notas internas"
        error={errors.internalNotes?.message}
        {...register('internalNotes')}
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};
