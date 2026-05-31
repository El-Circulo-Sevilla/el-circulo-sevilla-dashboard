import {
  type CreateEventPayload,
  type Event,
  type EventRegistration,
  type EventRegistrationWithPerson,
  type EventStatus,
  type UpdateEventPayload,
} from '@/features/events/types';
import { mockEvents, mockPeople, mockRegistrations } from '@/lib/mockData';
import { hasSupabaseEnv, supabase } from '@/lib/supabaseClient';
import { toAppError } from '@/lib/serviceResult';

const NETWORK_DELAY_MS = 320;

let eventsStore: Event[] = structuredClone(mockEvents);
let registrationsStore: EventRegistration[] = structuredClone(mockRegistrations);

type DashboardEventRow = {
  id: string;
  match_group_id: string | null;
  venue_id: number | null;
  title: string | null;
  event_type: string | null;
  description: string | null;
  scheduled_at: string | null;
  venue_name: string | null;
  zone: string | null;
  address: string | null;
  max_spots: number | null;
  price: number | string | null;
  status: string | null;
  image_url: string | null;
  internal_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type GroupMemberRow = {
  group_id?: string | number;
  user_id: string;
  attendance_status: string | null;
  joined_at?: string | null;
};

type ProfileRow = Record<string, unknown>;

const wait = (ms = NETWORK_DELAY_MS) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const clone = <T,>(value: T): T => structuredClone(value);

const withDateAndTime = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString();

const isSupabaseReady = () => hasSupabaseEnv && Boolean(supabase);

const toEventStatus = (value: string | null): EventStatus => {
  const normalized = (value ?? '').toLowerCase();

  if (normalized === 'open') return 'open';
  if (normalized === 'closed') return 'closed';
  if (normalized === 'completed') return 'completed';
  if (normalized === 'cancelled') return 'cancelled';
  return 'draft';
};

const toDbStatus = (status: EventStatus) => status.toUpperCase();
const emptyToNull = (value: string | null | undefined) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toOptionalNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const mapEventRowToEvent = (row: DashboardEventRow): Event => {
  const maxSpots = typeof row.max_spots === 'number' ? row.max_spots : 10;

  return {
    id: row.id,
    title: row.title ?? 'Evento sin título',
    description: row.description ?? '',
    type: row.event_type ?? 'Evento',
    scheduledAt: row.scheduled_at ?? new Date().toISOString(),
    location: row.venue_name ?? 'Lugar por confirmar',
    zone: row.zone ?? undefined,
    address: row.address ?? undefined,
    maxSpots,
    price: toOptionalNumber(row.price),
    status: toEventStatus(row.status),
    imageUrl: row.image_url ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    createdAt: row.created_at ?? row.scheduled_at ?? new Date().toISOString(),
  };
};

const toRegistrationStatus = (
  value: string | null,
): EventRegistration['status'] => {
  const normalized = (value ?? '').toUpperCase();

  if (normalized === 'ACCEPTED') return 'accepted';
  if (normalized === 'REJECTED') return 'rejected';
  if (normalized === 'ATTENDED') return 'attended';
  if (normalized === 'NO_SHOW') return 'no_show';
  return 'registered';
};

const mapProfileToSummary = (row: ProfileRow) => {
  const id = typeof row.user_id === 'string' ? row.user_id : '';
  const firstName = typeof row.first_name === 'string' ? row.first_name : '';
  const legacyName = typeof row.nombre === 'string' ? row.nombre : '';
  const email = typeof row.email === 'string' ? row.email : `${id.slice(0, 8)}@pendiente.local`;

  const interests = Array.isArray(row.interests)
    ? row.interests.filter((value): value is string => typeof value === 'string')
    : Array.isArray(row.intereses)
      ? row.intereses.filter((value): value is string => typeof value === 'string')
      : [];

  const ageValue = typeof row.age === 'number' ? row.age : Number(row.edad);

  return {
    id,
    name: firstName || legacyName || `Usuario ${id.slice(0, 6)}`,
    email,
    age: Number.isFinite(ageValue) ? ageValue : undefined,
    interests,
  };
};

const toRegistrationWithPerson = (
  registration: EventRegistration,
): EventRegistrationWithPerson | null => {
  const person = mockPeople.find((item) => item.id === registration.personId);
  if (!person) return null;

  return {
    ...registration,
    person: {
      id: person.id,
      name: person.name,
      email: person.email,
      age: person.age,
      interests: person.interests,
    },
  };
};

const fromMockStore = {
  async getEvents() {
    await wait();
    return clone(eventsStore);
  },

  async getEventById(eventId: string) {
    await wait();
    const event = eventsStore.find((item) => item.id === eventId);
    return event ? clone(event) : null;
  },

  async createEvent(payload: CreateEventPayload) {
    await wait();
    const event: Event = {
      id: `e-${crypto.randomUUID()}`,
      title: payload.title,
      description: payload.description,
      type: payload.type,
      scheduledAt: withDateAndTime(payload.date, payload.time),
      location: payload.location,
      zone: payload.zone,
      address: payload.address,
      maxSpots: payload.maxSpots,
      price: payload.price,
      status: payload.status,
      imageUrl: payload.imageUrl,
      internalNotes: payload.internalNotes,
      createdAt: new Date().toISOString(),
    };

    eventsStore = [event, ...eventsStore];
    return clone(event);
  },

  async updateEvent(eventId: string, payload: UpdateEventPayload) {
    await wait();

    const index = eventsStore.findIndex((item) => item.id === eventId);
    if (index === -1) {
      throw new Error('Evento no encontrado');
    }

    const updated = {
      ...eventsStore[index],
      ...payload,
    };

    eventsStore[index] = updated;
    return clone(updated);
  },

  async closeRegistrations(eventId: string) {
    await wait();

    const index = eventsStore.findIndex((item) => item.id === eventId);
    if (index === -1) {
      throw new Error('Evento no encontrado');
    }

    eventsStore[index] = {
      ...eventsStore[index],
      status: 'closed',
    };

    return clone(eventsStore[index]);
  },

  async getEventRegistrations(eventId: string) {
    await wait();

    const registrations = registrationsStore
      .filter((item) => item.eventId === eventId)
      .map(toRegistrationWithPerson)
      .filter((item): item is EventRegistrationWithPerson => item !== null);

    return clone(registrations);
  },

  async updateAcceptedPeople(eventId: string, personIds: string[]) {
    await wait();

    const event = eventsStore.find((item) => item.id === eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    if (personIds.length > event.maxSpots) {
      throw new Error('Se superó el máximo de plazas');
    }

    registrationsStore = registrationsStore.map((registration) => {
      if (registration.eventId !== eventId) return registration;

      if (personIds.includes(registration.personId)) {
        if (
          registration.status === 'registered' ||
          registration.status === 'accepted'
        ) {
          return { ...registration, status: 'accepted' };
        }
      }

      if (registration.status === 'accepted') {
        return { ...registration, status: 'registered' };
      }

      return registration;
    });

    return fromMockStore.getEventRegistrations(eventId);
  },

  async sendEmailToAcceptedPeople(eventId: string) {
    await wait(700);

    const accepted = registrationsStore.filter(
      (item) => item.eventId === eventId && item.status === 'accepted',
    );

    return {
      ok: true,
      recipients: accepted.length,
      sentAt: new Date().toISOString(),
    };
  },
};

const getEventRowById = async (eventId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (error) {
    throw new Error(
      toAppError(error, 'EVENT_FETCH_FAILED', 'No se pudo cargar el evento').message,
    );
  }

  return (data as DashboardEventRow | null) ?? null;
};

const getMatchGroupIdByDashboardEventId = async (eventId: string) => {
  const eventRow = await getEventRowById(eventId);
  if (!eventRow) return null;
  return eventRow.match_group_id;
};

export const eventService = {
  async getEvents() {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.getEvents();
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.warn(
        'Fallo cargando events en Supabase, usando mock.',
        toAppError(error, 'EVENTS_FETCH_FAILED', 'No se pudieron cargar los eventos'),
      );
      return fromMockStore.getEvents();
    }

    return ((data as DashboardEventRow[]) ?? []).map(mapEventRowToEvent);
  },

  async getEventById(eventId: string) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.getEventById(eventId);
    }

    const row = await getEventRowById(eventId);
    return row ? mapEventRowToEvent(row) : null;
  },

  async createEvent(payload: CreateEventPayload) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.createEvent(payload);
    }

    const scheduledAt = withDateAndTime(payload.date, payload.time);

    const insertPayload = {
      title: payload.title,
      event_type: payload.type,
      description: emptyToNull(payload.description),
      scheduled_at: scheduledAt,
      venue_name: payload.location,
      zone: emptyToNull(payload.zone),
      address: emptyToNull(payload.address),
      max_spots: payload.maxSpots,
      price: payload.price ?? null,
      status: toDbStatus(payload.status),
      image_url: emptyToNull(payload.imageUrl),
      internal_notes: emptyToNull(payload.internalNotes),
      venue_id: null,
      match_group_id: null,
    };

    const { data, error } = await supabase
      .from('events')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(
        toAppError(error, 'EVENT_CREATE_FAILED', 'No se pudo crear el evento').message,
      );
    }

    return mapEventRowToEvent(data as DashboardEventRow);
  },

  async updateEvent(eventId: string, payload: UpdateEventPayload) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.updateEvent(eventId, payload);
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.title === 'string') updatePayload.title = payload.title;
    if (typeof payload.description === 'string') updatePayload.description = emptyToNull(payload.description);
    if (typeof payload.type === 'string') updatePayload.event_type = payload.type;
    if (typeof payload.scheduledAt === 'string') updatePayload.scheduled_at = payload.scheduledAt;
    if (typeof payload.location === 'string') updatePayload.venue_name = payload.location;
    if (typeof payload.zone === 'string') updatePayload.zone = emptyToNull(payload.zone);
    if (typeof payload.address === 'string') updatePayload.address = emptyToNull(payload.address);
    if (typeof payload.maxSpots === 'number') updatePayload.max_spots = payload.maxSpots;
    if (Object.prototype.hasOwnProperty.call(payload, 'price')) {
      updatePayload.price = payload.price ?? null;
    }
    if (typeof payload.status === 'string') updatePayload.status = toDbStatus(payload.status);
    if (typeof payload.imageUrl === 'string') updatePayload.image_url = emptyToNull(payload.imageUrl);
    if (typeof payload.internalNotes === 'string') updatePayload.internal_notes = emptyToNull(payload.internalNotes);

    const { error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', eventId);

    if (error) {
      throw new Error(
        toAppError(error, 'EVENT_UPDATE_FAILED', 'No se pudo actualizar el evento').message,
      );
    }

    const updatedEvent = await eventService.getEventById(eventId);
    if (!updatedEvent) {
      throw new Error('Evento no encontrado tras actualizar.');
    }

    return updatedEvent;
  },

  async closeRegistrations(eventId: string) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.closeRegistrations(eventId);
    }

    const { error } = await supabase
      .from('events')
      .update({
        status: 'CLOSED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      throw new Error(
        toAppError(error, 'EVENT_CLOSE_FAILED', 'No se pudieron cerrar las inscripciones').message,
      );
    }

    const updatedEvent = await eventService.getEventById(eventId);
    if (!updatedEvent) {
      throw new Error('Evento no encontrado tras cerrar inscripciones.');
    }

    return updatedEvent;
  },

  async getEventRegistrations(eventId: string) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.getEventRegistrations(eventId);
    }

    const matchGroupId = await getMatchGroupIdByDashboardEventId(eventId);

    if (!matchGroupId) {
      return [];
    }

    const { data, error } = await supabase
      .from('group_members')
      .select('group_id,user_id,attendance_status,joined_at')
      .eq('group_id', matchGroupId);

    if (error) {
      console.warn(
        'Fallo cargando inscripciones en Supabase, usando mock.',
        toAppError(error, 'EVENT_REGISTRATIONS_FETCH_FAILED', 'No se pudieron cargar las inscripciones'),
      );
      return fromMockStore.getEventRegistrations(eventId);
    }

    const memberRows = (data as GroupMemberRow[]) ?? [];
    const userIds = memberRows.map((row) => row.user_id).filter(Boolean);

    let profileMap = new Map<string, ReturnType<typeof mapProfileToSummary>>();

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.warn(
          'Fallo cargando perfiles de inscritos.',
          toAppError(profilesError, 'PEOPLE_FETCH_FAILED', 'No se pudieron cargar perfiles'),
        );
      } else {
        profileMap = new Map(
          ((profilesData as ProfileRow[]) ?? [])
            .map(mapProfileToSummary)
            .map((profile) => [profile.id, profile]),
        );
      }
    }

    return memberRows.map((row) => {
      const profile = profileMap.get(row.user_id);
      return {
        id: `${eventId}-${row.user_id}`,
        eventId,
        personId: row.user_id,
        status: toRegistrationStatus(row.attendance_status),
        compatibilityScore: undefined,
        createdAt: row.joined_at ?? new Date().toISOString(),
        person: profile ?? {
          id: row.user_id,
          name: `Usuario ${row.user_id.slice(0, 6)}`,
          email: `${row.user_id.slice(0, 8)}@pendiente.local`,
          age: undefined,
          interests: [],
        },
      } satisfies EventRegistrationWithPerson;
    });
  },

  async updateAcceptedPeople(eventId: string, personIds: string[]) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.updateAcceptedPeople(eventId, personIds);
    }

    const eventRow = await getEventRowById(eventId);
    if (!eventRow) {
      throw new Error('Evento no encontrado');
    }

    if (personIds.length > (eventRow.max_spots ?? 10)) {
      throw new Error('Se superó el máximo de plazas');
    }

    const matchGroupId = eventRow.match_group_id;

    if (!matchGroupId) {
      throw new Error(
        'Este evento todavía no tiene match_group asociado. No se pueden gestionar aceptados.',
      );
    }

    const { data, error } = await supabase
      .from('group_members')
      .select('group_id,user_id,attendance_status,joined_at')
      .eq('group_id', matchGroupId);

    if (error) {
      throw new Error(
        toAppError(error, 'EVENT_REGISTRATIONS_FETCH_FAILED', 'No se pudieron cargar los inscritos').message,
      );
    }

    const rows = (data as GroupMemberRow[]) ?? [];

    const updates = rows.map((row) => ({
      group_id: matchGroupId,
      user_id: row.user_id,
      attendance_status: personIds.includes(row.user_id) ? 'ACCEPTED' : 'PENDING',
      joined_at: row.joined_at ?? new Date().toISOString(),
    }));

    if (updates.length > 0) {
      const { error: upsertError } = await supabase
        .from('group_members')
        .upsert(updates, { onConflict: 'group_id,user_id' });

      if (upsertError) {
        throw new Error(
          toAppError(upsertError, 'EVENT_ACCEPTED_UPDATE_FAILED', 'No se pudo actualizar la lista de aceptados').message,
        );
      }
    }

    return eventService.getEventRegistrations(eventId);
  },

  async sendEmailToAcceptedPeople(eventId: string) {
    const registrations = await eventService.getEventRegistrations(eventId);
    const accepted = registrations.filter((item) => item.status === 'accepted');

    await wait(700);

    return {
      ok: true,
      recipients: accepted.length,
      sentAt: new Date().toISOString(),
    };
  },
};
