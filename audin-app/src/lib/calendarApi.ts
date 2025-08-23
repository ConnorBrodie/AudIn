import { google } from 'googleapis';
import { CalendarEvent } from '@/types/calendar';

// Initialize Google Calendar API client
export function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return google.calendar({ version: 'v3', auth });
}

// Fetch calendar events for a date range
export async function fetchEventsForDateRange(accessToken: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  try {
    const calendar = getCalendarClient(accessToken);
    
    console.log(`📅 Fetching calendar events from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
    
    // Get start and end times in ISO format
    const startOfRange = new Date(startDate);
    startOfRange.setHours(0, 0, 0, 0);
    
    const endOfRange = new Date(endDate);
    endOfRange.setHours(23, 59, 59, 999);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfRange.toISOString(),
      timeMax: endOfRange.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50
    });

    const events = response.data.items || [];
    
    if (events.length === 0) {
      console.log('📅 No events found for the specified date range');
      return [];
    }

    console.log(`📅 Found ${events.length} events for the date range`);

    // Convert Google Calendar API response to our CalendarEvent type
    const calendarEvents: CalendarEvent[] = events.map(event => ({
      id: event.id || '',
      summary: event.summary || 'Untitled Event',
      description: event.description || '',
      start: {
        dateTime: event.start?.dateTime || event.start?.date || '',
        timeZone: event.start?.timeZone || ''
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || '',
        timeZone: event.end?.timeZone || ''
      },
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email || '',
        displayName: attendee.displayName || '',
        responseStatus: attendee.responseStatus || 'needsAction'
      })) || [],
      location: event.location || '',
      creator: {
        email: event.creator?.email || '',
        displayName: event.creator?.displayName || ''
      },
      organizer: {
        email: event.organizer?.email || '',
        displayName: event.organizer?.displayName || ''
      },
      status: event.status || 'confirmed',
      htmlLink: event.htmlLink || '',
      created: event.created || '',
      updated: event.updated || ''
    }));

    console.log(`✅ Successfully fetched ${calendarEvents.length} calendar events`);
    return calendarEvents;
    
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
}

// Fetch today's calendar events
export async function fetchTodaysEvents(accessToken: string): Promise<CalendarEvent[]> {
  try {
    const calendar = getCalendarClient(accessToken);
    
    console.log('📅 Fetching today\'s calendar events...');
    
    // Get start and end of today in ISO format
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50
    });

    const events = response.data.items || [];
    
    if (events.length === 0) {
      console.log('📅 No events found for today');
      return [];
    }

    console.log(`📅 Found ${events.length} events for today`);

    // Convert Google Calendar API response to our CalendarEvent type
    const calendarEvents: CalendarEvent[] = events.map(event => ({
      id: event.id || '',
      summary: event.summary || 'Untitled Event',
      description: event.description || '',
      start: {
        dateTime: event.start?.dateTime || event.start?.date || '',
        timeZone: event.start?.timeZone || ''
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || '',
        timeZone: event.end?.timeZone || ''
      },
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email || '',
        displayName: attendee.displayName || '',
        responseStatus: attendee.responseStatus || 'needsAction'
      })) || [],
      location: event.location || '',
      creator: {
        email: event.creator?.email || '',
        displayName: event.creator?.displayName || ''
      },
      organizer: {
        email: event.organizer?.email || '',
        displayName: event.organizer?.displayName || ''
      },
      status: event.status || 'confirmed',
      htmlLink: event.htmlLink || '',
      created: event.created || '',
      updated: event.updated || ''
    }));

    console.log(`✅ Successfully fetched ${calendarEvents.length} calendar events`);
    return calendarEvents;
    
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
}

// Helper function to check if an event is happening now
export function isEventNow(event: CalendarEvent): boolean {
  const now = new Date();
  const startTime = new Date(event.start.dateTime || event.start.date || '');
  const endTime = new Date(event.end.dateTime || event.end.date || '');
  
  return now >= startTime && now <= endTime;
}

// Helper function to get upcoming events (next 2 hours)
export function getUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  return events.filter(event => {
    const startTime = new Date(event.start.dateTime || event.start.date || '');
    return startTime > now && startTime <= twoHoursFromNow;
  });
}
