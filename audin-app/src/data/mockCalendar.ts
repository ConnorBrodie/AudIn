import { CalendarEvent } from '@/types/calendar';

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "event_001",
    summary: "Team Standup",
    description: "Daily team sync to discuss progress and blockers",
    start: {
      dateTime: "2025-01-15T09:00:00-08:00",
      timeZone: "America/Los_Angeles"
    },
    end: {
      dateTime: "2025-01-15T09:30:00-08:00",
      timeZone: "America/Los_Angeles"
    },
    attendees: [
      { email: "team@company.com", displayName: "Development Team", responseStatus: "accepted" },
      { email: "sarah.johnson@company.com", displayName: "Sarah Johnson", responseStatus: "accepted" },
      { email: "mike.chen@company.com", displayName: "Mike Chen", responseStatus: "accepted" }
    ],
    status: "confirmed"
  },
  {
    id: "event_002",
    summary: "Client Presentation Meeting", 
    description: "Q4 project review and next quarter planning with ABC Corp",
    start: {
      dateTime: "2025-01-15T14:00:00-08:00",
      timeZone: "America/Los_Angeles"
    },
    end: {
      dateTime: "2025-01-15T15:00:00-08:00",
      timeZone: "America/Los_Angeles"
    },
    attendees: [
      { email: "mike.chen@company.com", displayName: "Mike Chen", responseStatus: "accepted" },
      { email: "client@abccorp.com", displayName: "ABC Corp Team", responseStatus: "accepted" }
    ],
    location: "Conference Room A / Zoom",
    status: "confirmed"
  },
  {
    id: "event_003",
    summary: "One-on-One with Manager",
    description: "Monthly check-in to discuss goals, feedback, and career development",
    start: {
      dateTime: "2025-01-15T16:30:00-08:00", 
      timeZone: "America/Los_Angeles"
    },
    end: {
      dateTime: "2025-01-15T17:00:00-08:00",
      timeZone: "America/Los_Angeles"
    },
    attendees: [
      { email: "manager@company.com", displayName: "Alex Rivera", responseStatus: "accepted" }
    ],
    location: "Manager's Office",
    status: "confirmed"
  }
];
