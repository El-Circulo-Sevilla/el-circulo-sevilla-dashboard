import {
  type CreateEventPayload,
  type Event,
  type EventRegistration,
  type EventRegistrationWithPerson,
  type UpdateEventPayload,
} from '@/features/events/types';
import { mockEvents, mockPeople, mockRegistrations } from '@/lib/mockData';

const NETWORK_DELAY_MS = 320;

let eventsStore: Event[] = structuredClone(mockEvents);
let registrationsStore: EventRegistration[] = structuredClone(mockRegistrations);

const wait = (ms = NETWORK_DELAY_MS) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const clone = <T,>(value: T): T => structuredClone(value);

const withDateAndTime = (date: string, time: string) => {
  const isoString = new Date(`${date}T${time}:00`).toISOString();
  return isoString;
};

const buildEventFromPayload = (payload: CreateEventPayload): Event => ({
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
});

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

export const eventService = {
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
    const event = buildEventFromPayload(payload);
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

    const registrations = registrationsStore
      .filter((item) => item.eventId === eventId)
      .map(toRegistrationWithPerson)
      .filter((item): item is EventRegistrationWithPerson => item !== null);

    return clone(registrations);
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
