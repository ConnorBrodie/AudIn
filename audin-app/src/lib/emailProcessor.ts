import { Email, ProcessedEmail, EmailHeader } from '@/types/email';
import { CalendarEvent, ProcessedCalendarEvent } from '@/types/calendar';
import { EmailSummary, CalendarSummary } from '@/types/digest';
import { convertTimeToNatural, convertDurationToNatural } from './timeUtils';

// Helper function to extract header value
function getHeaderValue(headers: EmailHeader[], name: string): string {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

// Convert raw Gmail API email to processed format
export function processEmail(email: Email): ProcessedEmail {
  const headers = email.payload.headers;
  
  return {
    id: email.id,
    from: getHeaderValue(headers, 'From'),
    to: getHeaderValue(headers, 'To'),
    subject: getHeaderValue(headers, 'Subject'),
    body: email.payload.body.data,
    date: new Date(parseInt(email.internalDate)),
    snippet: email.snippet,
    isUnread: email.labelIds?.includes('UNREAD') || false
  };
}

// Convert raw Calendar API event to processed format
export function processCalendarEvent(event: CalendarEvent): ProcessedCalendarEvent {
  const startTime = new Date(event.start.dateTime || event.start.date!);
  const endTime = new Date(event.end.dateTime || event.end.date!);
  
  // Calculate duration
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMins = Math.round(durationMs / (1000 * 60));
  const duration = durationMins >= 60 
    ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
    : `${durationMins}m`;

  return {
    id: event.id,
    title: event.summary,
    startTime: startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    endTime: endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    duration,
    attendees: event.attendees?.map(a => a.displayName || a.email),
    location: event.location
  };
}

// Convert calendar event to natural podcast format  
export function processCalendarEventForPodcast(event: CalendarEvent): CalendarSummary {
  const startTime = new Date(event.start.dateTime || event.start.date!);
  const endTime = new Date(event.end.dateTime || event.end.date!);
  
  // Calculate duration
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMins = Math.round(durationMs / (1000 * 60));
  const durationString = durationMins >= 60 
    ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
    : `${durationMins}m`;

  // Convert to natural time format
  const naturalTime = convertTimeToNatural(startTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }));

  const naturalDuration = convertDurationToNatural(durationString);

  return {
    title: event.summary,
    time: naturalTime,
    duration: naturalDuration,
    attendees: event.attendees?.map(a => a.displayName || a.email),
    location: event.location
  };
}

// Sort emails by urgency score (highest first)
export function sortEmailsByUrgency(emails: EmailSummary[]): EmailSummary[] {
  return [...emails].sort((a, b) => b.urgency_score - a.urgency_score);
}

// Prepare emails for GPT processing
export function prepareEmailsForGPT(emails: ProcessedEmail[]): string {
  return emails.map((email, index) => {
    return `EMAIL ${index + 1}:
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date.toLocaleDateString()}
Content: ${email.body}
---`;
  }).join('\n\n');
}

// Prepare calendar events for GPT processing  
export function prepareCalendarForGPT(events: ProcessedCalendarEvent[]): string {
  if (events.length === 0) return "No calendar events for today.";
  
  return `TODAY'S CALENDAR EVENTS:
${events.map(event => 
  `• ${event.startTime} - ${event.title} (${event.duration})${event.location ? ` at ${event.location}` : ''}`
).join('\n')}`;
}
