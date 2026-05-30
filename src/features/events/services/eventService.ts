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

type VenueRow = {
  id?: string | number;
  name: string | null;
  zone: string | null;
  category?: string | null;
};

type GroupMemberRow = {
  group_id?: string | number;
  user_id: string;
  attendance_status: string | null;
  joined_at?: string | null;
};

type MatchGroupRow = {
  id: string | number;
  title: string | null;
  event_type: string | null;
  icon_name: string | null;
  scheduled_at: string | null;
  max_spots: number | null;
  description: string | null;
  group_status: string | null;
  venue: VenueRow | VenueRow[] | null;
  members?: GroupMemberRow[] | null;
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

const asVenue = (value: MatchGroupRow['venue']): VenueRow | null => {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
};

const toEventStatus = (value: string | null): EventStatus => {
  const normalized = (value ?? '').toLowerCase();

  if (normalized === 'open') return 'open';
  if (normalized === 'closed') return 'closed';
  if (normalized === 'completed') return 'completed';
  if (normalized === 'cancelled') return 'cancelled';
  return 'draft';
};

const toGroupStatus = (status: EventStatus) => status.toUpperCase();

const toEvent = (row: MatchGroupRow): Event => {
  const venue = asVenue(row.venue);

  return {
    id: String(row.id),
    title: row.title ?? 'Evento sin título',
    description: row.description ?? '',
    type: row.event_type ?? 'Evento',
    scheduledAt: row.scheduled_at ?? new Date().toISOString(),
    location: venue?.name ?? 'Lugar por confirmar',
    zone: venue?.zone ?? undefined,
    address: undefined,
    maxSpots: row.max_spots ?? 0,
    price: undefined,
    status: toEventStatus(row.group_status),
    imageUrl: row.icon_name ?? undefined,
    internalNotes: undefined,
    createdAt: row.scheduled_at ?? new Date().toISOString(),
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

export const eventService = {
  async getEvents() {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.getEvents();
    }

    const { data, error } = await supabase
      .from('match_groups')
      .select(
        `
        id,
        title,
        event_type,
        icon_name,
        scheduled_at,
        max_spots,
        description,
        group_status,
        venue:venues(
          id,
          name,
          zone,
          category
        )
      `,
      )
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.warn(
        'Fallo cargando eventos en Supabase, usando mock.',
        toAppError(error, 'EVENTS_FETCH_FAILED', 'No se pudieron cargar los eventos'),
      );
      return fromMockStore.getEvents();
    }

    return (data as MatchGroupRow[]).map(toEvent);
  },

  async getEventById(eventId: string) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.getEventById(eventId);
    }

    const { data, error } = await supabase
      .from('match_groups')
      .select(
        `
        id,
        title,
        event_type,
        icon_name,
        scheduled_at,
        max_spots,
        description,
        group_status,
        venue:venues(
          id,
          name,
          zone,
          category
        )
      `,
      )
      .eq('id', eventId)
      .maybeSingle();

    if (error) {
      console.warn(
        'Fallo cargando evento en Supabase, usando mock.',
        toAppError(error, 'EVENT_FETCH_FAILED', 'No se pudo cargar el evento'),
      );
      return fromMockStore.getEventById(eventId);
    }

    return data ? toEvent(data as MatchGroupRow) : null;
  },

  async createEvent(payload: CreateEventPayload) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.createEvent(payload);
    }

    const scheduledAt = withDateAndTime(payload.date, payload.time);

    let venueId: string | number | null = null;

    if (payload.location) {
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert({
          name: payload.location,
          zone: payload.zone ?? null,
          category: payload.type,
        })
        .select('id')
        .single();

      if (venueError) {
        throw new Error(
          toAppError(venueError, 'VENUE_CREATE_FAILED', 'No se pudo crear el lugar del evento')
            .message,
        );
      }

      venueId = (venueData as { id: string | number }).id;
    }

    const insertPayload: Record<string, unknown> = {
      title: payload.title,
      event_type: payload.type,
      scheduled_at: scheduledAt,
      max_spots: payload.maxSpots,
      description: payload.description ?? null,
      group_status: toGroupStatus(payload.status),
      icon_name: payload.imageUrl ?? null,
    };

    if (venueId) {
      insertPayload.venue_id = venueId;
    }

    const { data, error } = await supabase
      .from('match_groups')
      .insert(insertPayload)
      .select(
        `
        id,
        title,
        event_type,
        icon_name,
        scheduled_at,
        max_spots,
        description,
        group_status,
        venue:venues(
          id,
          name,
          zone,
          category
        )
      `,
      )
      .single();

    if (error) {
      throw new Error(
        toAppError(error, 'EVENT_CREATE_FAILED', 'No se pudo crear el evento').message,
      );
    }

    return toEvent(data as MatchGroupRow);
  },

  async updateEvent(eventId: string, payload: UpdateEventPayload) {
    if (!isSupabaseReady() || !supabase) {
      return fromMockStore.updateEvent(eventId, payload);
    }

    const updatePayload: Record<string, unknown> = {};

    if (typeof payload.title === 'string') updatePayload.title = payload.title;
    if (typeof payload.description === 'string') updatePayload.description = payload.description;
    if (typeof payload.type === 'string') updatePayload.event_type = payload.type;
    if (typeof payload.scheduledAt === 'string') updatePayload.scheduled_at = payload.scheduledAt;
    if (typeof payload.maxSpots === 'number') updatePayload.max_spots = payload.maxSpots;
    if (typeof payload.status === 'string') updatePayload.group_status = toGroupStatus(payload.status);
    if (typeof payload.imageUrl === 'string') updatePayload.icon_name = payload.imageUrl;

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabase
        .from('match_groups')
        .update(updatePayload)
        .eq('id', eventId);

      if (error) {
        throw new Error(
          toAppError(error, 'EVENT_UPDATE_FAILED', 'No se pudo actualizar el evento').message,
        );
      }
    }

    if (payload.location || payload.zone) {
      const { data: matchGroupData } = await supabase
        .from('match_groups')
        .select('venue:venues(id)')
        .eq('id', eventId)
        .maybeSingle();

      const venueCandidate = (matchGroupData as { venue?: { id?: string | number } | { id?: string | number }[] } | null)?.venue;
      const venue = Array.isArray(venueCandidate) ? venueCandidate[0] : venueCandidate;

      if (venue?.id) {
        const venueUpdatePayload: Record<string, unknown> = {};
        if (typeof payload.location === 'string') venueUpdatePayload.name = payload.location;
        if (typeof payload.zone === 'string') venueUpdatePayload.zone = payload.zone;

        if (Object.keys(venueUpdatePayload).length > 0) {
          const { error: venueError } = await supabase
            .from('venues')
            .update(venueUpdatePayload)
            .eq('id', venue.id);

          if (venueError) {
            throw new Error(
              toAppError(venueError, 'VENUE_UPDATE_FAILED', 'No se pudo actualizar el lugar').message,
            );
          }
        }
      }
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
      .from('match_groups')
      .update({ group_status: 'CLOSED' })
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

    const { data, error } = await supabase
      .from('group_members')
      .select('group_id,user_id,attendance_status,joined_at')
      .eq('group_id', eventId);

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

    const event = await eventService.getEventById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    if (personIds.length > event.maxSpots) {
      throw new Error('Se superó el máximo de plazas');
    }

    const { data, error } = await supabase
      .from('group_members')
      .select('group_id,user_id,attendance_status,joined_at')
      .eq('group_id', eventId);

    if (error) {
      throw new Error(
        toAppError(error, 'EVENT_REGISTRATIONS_FETCH_FAILED', 'No se pudieron cargar los inscritos').message,
      );
    }

    const rows = (data as GroupMemberRow[]) ?? [];

    const updates = rows.map((row) => ({
      group_id: eventId,
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
