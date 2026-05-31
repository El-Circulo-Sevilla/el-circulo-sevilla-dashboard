import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Event, EventStatus } from '@/features/events/types';
import { formatDateTime } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  registeredCount: number;
  acceptedCount: number;
}

const statusMap: Record<EventStatus, { label: string; variant: 'neutral' | 'warning' | 'success' | 'danger' | 'info' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  published: { label: 'Publicado', variant: 'success' },
  full: { label: 'Completo', variant: 'warning' },
  completed: { label: 'Completado', variant: 'info' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

export const EventCard = ({ event, registeredCount, acceptedCount }: EventCardProps) => (
  <Card className="flex h-full flex-col justify-between gap-4 border-brand-200 transition-all hover:border-brand-400 hover:shadow-lg">
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{event.title}</h3>
        <Badge variant={statusMap[event.status].variant}>{statusMap[event.status].label}</Badge>
      </div>

      <div className="grid gap-1 text-sm text-mute">
        <p>
          <strong className="text-dark-500">Tipo:</strong> {event.type}
        </p>
        <p>
          <strong className="text-dark-500">Fecha:</strong> {formatDateTime(event.scheduledAt)}
        </p>
        <p>
          <strong className="text-dark-500">Lugar:</strong> {event.location}
        </p>
        <p>
          <strong className="text-dark-500">Plazas:</strong> {acceptedCount}/{event.maxSpots}
        </p>
        <p>
          <strong className="text-dark-500">Inscritos:</strong> {registeredCount}
        </p>
      </div>
    </div>

    <div>
      <Link to={`/dashboard/eventos/${event.id}`}>
        <Button variant="secondary" className="w-full">
          Ver detalle
        </Button>
      </Link>
    </div>
  </Card>
);
