// TypeScript interfaces for Google Calendar API data structures

export interface CalendarDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: CalendarDateTime;
  end: CalendarDateTime;
  attendees?: CalendarAttendee[];
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

// Processed calendar event interface for our pipeline
export interface ProcessedCalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  attendees?: string[];
  location?: string;
}
