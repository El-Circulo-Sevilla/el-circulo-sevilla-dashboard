import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PeopleTable } from '@/features/people/components/PeopleTable';
import { PersonCard } from '@/features/people/components/PersonCard';
import { peopleService } from '@/features/people/services/peopleService';
import type { Person, PersonStatus } from '@/features/people/types';
import { formatDateTime } from '@/lib/utils';

const statusOrder: PersonStatus[] = ['active', 'pending', 'rejected', 'inactive'];

const nextStatus = (status: PersonStatus): PersonStatus => {
  const index = statusOrder.indexOf(status);
  return statusOrder[(index + 1) % statusOrder.length];
};

export const PeoplePage = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewPerson, setViewPerson] = useState<Person | null>(null);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [deactivatePerson, setDeactivatePerson] = useState<Person | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadPeople = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await peopleService.getPeople();
      setPeople(result);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'No se pudieron cargar las personas.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPeople();
  }, []);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return people;

    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        person.city?.toLowerCase().includes(query),
    );
  }, [people, search]);

  const updatePersonInState = (
    personId: string,
    updater: (current: Person) => Person,
  ) => {
    setPeople((current) =>
      current.map((person) => (person.id === personId ? updater(person) : person)),
    );
  };

  const persistPersonUpdate = async (
    personId: string,
    payload: Partial<Person>,
    successMessage: string,
  ) => {
    try {
      await peopleService.updatePerson(personId, payload);
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? `Cambio local aplicado, pero no se pudo sincronizar: ${error.message}`
          : 'Cambio local aplicado, pero no se pudo sincronizar en Supabase.',
      );
    }
  };

  return (
    <section className="grid gap-5">
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Personas registradas</h2>
          <p className="text-sm text-mute">Gestiona perfiles, estado y actividad reciente.</p>
        </div>
        <Input
          placeholder="Buscar por nombre, email o ciudad"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full md:w-80"
        />
      </Card>

      {feedback ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {loadError ? (
        <Card className="grid gap-3">
          <p className="text-sm text-rose-700">{loadError}</p>
          <div>
            <button
              onClick={() => void loadPeople()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
              Reintentar
            </button>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm text-slate-600">Cargando personas...</p>
        </Card>
      ) : null}

      {!loading && !loadError && filteredPeople.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No hay personas que coincidan con tu búsqueda.</p>
        </Card>
      ) : null}

      {!loading && !loadError && filteredPeople.length > 0 ? (
        <>
          <div className="hidden md:block">
            <PeopleTable
              people={filteredPeople}
              onView={setViewPerson}
              onEdit={setEditPerson}
              onToggleStatus={(person) => {
                const status = nextStatus(person.status);
                updatePersonInState(person.id, (current) => ({
                  ...current,
                  status,
                }));

                void persistPersonUpdate(
                  person.id,
                  { status },
                  `Estado actualizado para ${person.name}.`,
                );
              }}
              onDeactivate={setDeactivatePerson}
            />
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onView={setViewPerson}
                onEdit={setEditPerson}
                onToggleStatus={(currentPerson) => {
                  const status = nextStatus(currentPerson.status);
                  updatePersonInState(currentPerson.id, (current) => ({
                    ...current,
                    status,
                  }));

                  void persistPersonUpdate(
                    currentPerson.id,
                    { status },
                    `Estado actualizado para ${currentPerson.name}.`,
                  );
                }}
                onDeactivate={setDeactivatePerson}
              />
            ))}
          </div>
        </>
      ) : null}

      <Modal
        open={viewPerson !== null}
        title={viewPerson?.name ?? 'Detalle de persona'}
        description={viewPerson?.email}
        onClose={() => setViewPerson(null)}
      >
        {viewPerson ? (
          <div className="grid gap-2 text-sm text-slate-600">
            <p>
              <strong className="text-ink">Edad:</strong> {viewPerson.age ?? '-'}
            </p>
            <p>
              <strong className="text-ink">Ciudad:</strong> {viewPerson.city ?? '-'}
            </p>
            <p>
              <strong className="text-ink">Registro:</strong> {formatDateTime(viewPerson.createdAt)}
            </p>
            <p>
              <strong className="text-ink">Última actividad:</strong>{' '}
              {viewPerson.lastActivityAt ? formatDateTime(viewPerson.lastActivityAt) : '-'}
            </p>
            <p>
              <strong className="text-ink">Intereses:</strong> {viewPerson.interests.join(', ')}
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editPerson !== null}
        title={editPerson?.name ?? 'Editar persona'}
        description="Actualiza los datos básicos y el estado"
        onClose={() => setEditPerson(null)}
      >
        {editPerson ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();

              updatePersonInState(editPerson.id, () => editPerson);
              void persistPersonUpdate(
                editPerson.id,
                {
                  name: editPerson.name,
                  city: editPerson.city,
                  age: editPerson.age,
                  status: editPerson.status,
                },
                `Datos guardados para ${editPerson.name}.`,
              );

              setEditPerson(null);
            }}
          >
            <Input
              label="Nombre"
              value={editPerson.name}
              onChange={(event) =>
                setEditPerson((current) =>
                  current ? { ...current, name: event.target.value } : current,
                )
              }
              required
            />
            <Input
              label="Ciudad"
              value={editPerson.city ?? ''}
              onChange={(event) =>
                setEditPerson((current) =>
                  current ? { ...current, city: event.target.value } : current,
                )
              }
            />
            <Select
              label="Estado"
              value={editPerson.status}
              onChange={(event) =>
                setEditPerson((current) =>
                  current
                    ? { ...current, status: event.target.value as PersonStatus }
                    : current,
                )
              }
            >
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
              <option value="inactive">Inactivo</option>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                onClick={() => setEditPerson(null)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deactivatePerson !== null}
        title="Desactivar persona"
        description={`Se cambiará a inactiva la cuenta de ${deactivatePerson?.name ?? ''}.`}
        confirmText="Desactivar"
        danger
        onCancel={() => setDeactivatePerson(null)}
        onConfirm={() => {
          if (!deactivatePerson) return;

          updatePersonInState(deactivatePerson.id, (current) => ({
            ...current,
            status: 'inactive',
          }));

          void persistPersonUpdate(
            deactivatePerson.id,
            { status: 'inactive' },
            `Cuenta desactivada para ${deactivatePerson.name}.`,
          );

          setDeactivatePerson(null);
        }}
      />
    </section>
  );
};
