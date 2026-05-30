import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Person, PersonStatus } from '@/features/people/types';
import { formatDate } from '@/lib/utils';

interface PersonCardProps {
  person: Person;
  onView: (person: Person) => void;
  onEdit: (person: Person) => void;
  onToggleStatus: (person: Person) => void;
  onDeactivate: (person: Person) => void;
}

const statusMap: Record<PersonStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  active: { label: 'Activo', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  rejected: { label: 'Rechazado', variant: 'danger' },
  inactive: { label: 'Inactivo', variant: 'neutral' },
};

export const PersonCard = ({
  person,
  onView,
  onEdit,
  onToggleStatus,
  onDeactivate,
}: PersonCardProps) => (
  <Card className="grid gap-3">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold text-ink">{person.name}</p>
        <p className="text-sm text-slate-600">{person.email}</p>
      </div>
      <Badge variant={statusMap[person.status].variant}>{statusMap[person.status].label}</Badge>
    </div>

    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
      <span>Edad: {person.age ?? '-'}</span>
      <span>Ciudad: {person.city ?? '-'}</span>
      <span>Registro: {formatDate(person.createdAt)}</span>
      <span>Últ. actividad: {person.lastActivityAt ? formatDate(person.lastActivityAt) : '-'}</span>
    </div>

    <div className="flex flex-wrap gap-1">
      {person.interests.map((interest) => (
        <Badge key={interest} variant="accent">
          {interest}
        </Badge>
      ))}
    </div>

    <div className="flex flex-wrap gap-2 pt-1">
      <Button size="sm" variant="secondary" onClick={() => onView(person)}>
        Ver
      </Button>
      <Button size="sm" variant="secondary" onClick={() => onEdit(person)}>
        Editar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onToggleStatus(person)}>
        Cambiar estado
      </Button>
      <Button size="sm" variant="danger" onClick={() => onDeactivate(person)}>
        Desactivar
      </Button>
    </div>
  </Card>
);
