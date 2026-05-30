import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Person, PersonStatus } from "@/features/people/types";
import { formatDate } from "@/lib/utils";

interface PeopleTableProps {
  people: Person[];
  onView: (person: Person) => void;
  onEdit: (person: Person) => void;
  onToggleStatus: (person: Person) => void;
  onDeactivate: (person: Person) => void;
}

const statusMap: Record<
  PersonStatus,
  { label: string; variant: "success" | "warning" | "danger" | "neutral" }
> = {
  active: { label: "Activo", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  rejected: { label: "Rechazado", variant: "danger" },
  inactive: { label: "Inactivo", variant: "neutral" },
};

export const PeopleTable = ({
  people,
  onView,
  onEdit,
  onToggleStatus,
  onDeactivate,
}: PeopleTableProps) => (
  <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white shadow-panel">
    <table className="min-w-full text-left text-sm">
      <thead className="border-b border-brand-200 bg-brand-50 text-xs uppercase tracking-wide text-dark-300">
        <tr>
          <th className="px-4 py-3">Nombre</th>
          <th className="px-4 py-3">Email</th>
          <th className="px-4 py-3">Edad</th>
          <th className="px-4 py-3">Ciudad</th>
          <th className="px-4 py-3">Estado</th>
          <th className="px-4 py-3">Registro</th>
          <th className="px-4 py-3">Tags</th>
          <th className="px-4 py-3">Última actividad</th>
          <th className="px-4 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr
            key={person.id}
            className="border-b border-brand-100 transition-colors hover:bg-brand-50/60"
          >
            <td className="px-4 py-3 font-medium text-ink">{person.name}</td>
            <td className="px-4 py-3 text-mute">{person.email}</td>
            <td className="px-4 py-3 text-mute">{person.age ?? "-"}</td>
            <td className="px-4 py-3 text-mute">{person.city ?? "-"}</td>
            <td className="px-4 py-3">
              <Badge variant={statusMap[person.status].variant}>
                {statusMap[person.status].label}
              </Badge>
            </td>
            <td className="px-4 py-3 text-mute">
              {formatDate(person.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {person.interests.slice(0, 2).map((interest) => (
                  <Badge key={interest} variant="accent">
                    {interest}
                  </Badge>
                ))}
              </div>
            </td>
            <td className="px-4 py-3 text-mute">
              {person.lastActivityAt ? formatDate(person.lastActivityAt) : "-"}
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onView(person)}
                >
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(person)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleStatus(person)}
                >
                  Estado
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDeactivate(person)}
                >
                  Desactivar
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
