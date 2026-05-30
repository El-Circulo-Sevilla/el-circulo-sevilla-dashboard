export type EventStatus = 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: string;
  scheduledAt: string;
  location: string;
  zone?: string;
  address?: string;
  maxSpots: number;
  price?: number;
  status: EventStatus;
  imageUrl?: string;
  internalNotes?: string;
  createdAt: string;
}

export type RegistrationStatus =
  | 'registered'
  | 'accepted'
  | 'rejected'
  | 'attended'
  | 'no_show';

export interface EventRegistration {
  id: string;
  eventId: string;
  personId: string;
  status: RegistrationStatus;
  compatibilityScore?: number;
  createdAt: string;
}

export interface EventRegistrationWithPerson extends EventRegistration {
  person: {
    id: string;
    name: string;
    email: string;
    age?: number;
    interests: string[];
  };
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  type: string;
  date: string;
  time: string;
  location: string;
  zone?: string;
  address?: string;
  maxSpots: number;
  price?: number;
  status: EventStatus;
  imageUrl?: string;
  internalNotes?: string;
}

export type UpdateEventPayload = Partial<Omit<Event, 'id' | 'createdAt'>>;
