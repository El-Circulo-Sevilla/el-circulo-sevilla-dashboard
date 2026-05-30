import type { Person, PersonStatus } from '@/features/people/types';
import { mockPeople } from '@/lib/mockData';
import { hasSupabaseEnv, supabase } from '@/lib/supabaseClient';
import { toAppError } from '@/lib/serviceResult';

type ProfileRow = Record<string, unknown>;

const clone = <T,>(value: T): T => structuredClone(value);

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string');
};

const toPersonStatus = (row: ProfileRow): PersonStatus => {
  const canJoinEvents = row.can_join_events;
  const isProfileComplete = row.is_profile_complete;

  if (canJoinEvents === true) return 'active';
  if (isProfileComplete === false) return 'pending';
  if (canJoinEvents === false) return 'inactive';
  return 'pending';
};

const mapProfileToPerson = (row: ProfileRow): Person | null => {
  const userId = asString(row.user_id);
  if (!userId) return null;

  const firstName = asString(row.first_name);
  const legacyName = asString(row.nombre);
  const name = firstName || legacyName || `Usuario ${userId.slice(0, 6)}`;

  const directEmail = asString(row.email);
  const email = directEmail || `${userId.slice(0, 8)}@pendiente.local`;

  const interests = asStringArray(row.interests).length
    ? asStringArray(row.interests)
    : asStringArray(row.intereses);

  return {
    id: userId,
    name,
    email,
    age: asNumber(row.age) ?? asNumber(row.edad),
    city: asString(row.neighborhood) || asString(row.barrio) || undefined,
    interests,
    status: toPersonStatus(row),
    createdAt:
      asString(row.created_at) || asString(row.updated_at) || new Date().toISOString(),
    lastActivityAt: asString(row.updated_at) || undefined,
  };
};

const statusToProfileFlags = (status: PersonStatus) => {
  if (status === 'active') {
    return { can_join_events: true, is_profile_complete: true };
  }

  if (status === 'pending') {
    return { can_join_events: false, is_profile_complete: false };
  }

  if (status === 'inactive') {
    return { can_join_events: false };
  }

  return { can_join_events: false };
};

export const peopleService = {
  async getPeople() {
    if (!hasSupabaseEnv || !supabase) {
      return clone(mockPeople);
    }

    const { data, error } = await supabase.from('user_profiles').select('*');

    if (error) {
      console.warn('Fallo cargando user_profiles, usando mock.', toAppError(error, 'PEOPLE_FETCH_FAILED', 'No se pudieron cargar las personas'));
      return clone(mockPeople);
    }

    const mapped = (data as ProfileRow[])
      .map(mapProfileToPerson)
      .filter((person): person is Person => person !== null);

    return mapped;
  },

  async updatePerson(personId: string, payload: Partial<Person>) {
    if (!hasSupabaseEnv || !supabase) return;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.name === 'string') {
      updatePayload.first_name = payload.name;
    }

    if (typeof payload.city === 'string') {
      updatePayload.neighborhood = payload.city;
    }

    if (typeof payload.age === 'number') {
      updatePayload.age = payload.age;
    }

    if (payload.status) {
      Object.assign(updatePayload, statusToProfileFlags(payload.status));
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('user_id', personId);

    if (error) {
      throw new Error(
        toAppError(error, 'PEOPLE_UPDATE_FAILED', 'No se pudo actualizar la persona').message,
      );
    }
  },
};
