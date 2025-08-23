import { Email, ProcessedEmail, EmailHeader } from '@/types/email';
import { CalendarEvent, ProcessedCalendarEvent } from '@/types/calendar';
import { EmailSummary, CalendarSummary } from '@/types/digest';
import { convertTimeToNatural, convertDurationToNatural } from './timeUtils';

// Helper function to extract header value
function getHeaderValue(headers: EmailHeader[], name: string): string {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

// Helper function to extract sender name from email address
function extractSenderName(fromHeader: string): string {
  // Handle various formats: "Name <email@domain.com>", "email@domain.com", "Name"
  const nameMatch = fromHeader.match(/^([^<]+?)\s*<.*>$/);
  if (nameMatch) {
    return nameMatch[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
  }
  
  // If no name in brackets, check if it's just an email
  if (fromHeader.includes('@')) {
    return fromHeader.split('@')[0]; // Use email username as fallback
  }
  
  return fromHeader; // Return as-is if it's just a name
}

// Helper function to detect forwarded emails and extract forwarding info
function detectForwardedEmail(email: Email): { isForwarded: boolean; forwardedBy?: string; originalSender?: string } {
  const headers = email.payload.headers;
  const subject = getHeaderValue(headers, 'Subject');
  const from = getHeaderValue(headers, 'From');
  
  // Check if subject indicates forwarding
  const subjectIndicatesForwarding = /^(fwd?:|fw:|forwarded:)/i.test(subject.trim());
  
  if (!subjectIndicatesForwarding) {
    return { isForwarded: false };
  }
  
  // Get the person who forwarded the email (current "From" header)
  const forwardedBy = extractSenderName(from);
  
  // Try to extract original sender from email body or headers
  let originalSender: string | undefined;
  
  // Check for forwarding headers that some email clients add
  const xForwardedFor = getHeaderValue(headers, 'X-Forwarded-For');
  const xOriginalSender = getHeaderValue(headers, 'X-Original-Sender');
  
  if (xOriginalSender) {
    originalSender = extractSenderName(xOriginalSender);
  } else if (xForwardedFor) {
    originalSender = extractSenderName(xForwardedFor);
  } else {
    // Try to parse original sender from email body
    const emailBody = email.snippet || '';
    
    // Look for common forwarding patterns in email body
    const forwardingPatterns = [
      /From:\s*([^\n<]+?)(?:\s*<[^>]+>)?\s*\n/i,
      /Originally sent by:\s*([^\n<]+?)(?:\s*<[^>]+>)?\s*\n/i,
      /---------- Forwarded message ----------[\s\S]*?From:\s*([^\n<]+?)(?:\s*<[^>]+>)?\s*\n/i,
      /Begin forwarded message:[\s\S]*?From:\s*([^\n<]+?)(?:\s*<[^>]+>)?\s*\n/i
    ];
    
    for (const pattern of forwardingPatterns) {
      const match = emailBody.match(pattern);
      if (match && match[1]) {
        originalSender = match[1].trim().replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
  
  return {
    isForwarded: true,
    forwardedBy,
    originalSender
  };
}

// Convert raw Gmail API email to processed format
export function processEmail(email: Email): ProcessedEmail {
  const headers = email.payload.headers;
  const forwardingInfo = detectForwardedEmail(email);
  
  return {
    id: email.id,
    from: getHeaderValue(headers, 'From'),
    to: getHeaderValue(headers, 'To'),
    subject: getHeaderValue(headers, 'Subject'),
    body: email.payload.body.data,
    date: new Date(parseInt(email.internalDate)),
    snippet: email.snippet,
    isUnread: email.labelIds?.includes('UNREAD') || false,
    // Include forwarding information
    isForwarded: forwardingInfo.isForwarded,
    forwardedBy: forwardingInfo.forwardedBy,
    originalSender: forwardingInfo.originalSender
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

// Sort emails by importance score (highest first)
export function sortEmailsByImportance(emails: EmailSummary[]): EmailSummary[] {
  console.log(`🔄 Sorting ${emails.length} emails by importance...`);
  
  // Check for duplicates
  const senders = emails.map(e => e.sender);
  const uniqueSenders = new Set(senders);
  if (senders.length !== uniqueSenders.size) {
    console.warn(`⚠️ Found ${senders.length - uniqueSenders.size} duplicate emails!`);
  }
  
  const sorted = [...emails].sort((a, b) => b.importance_score - a.importance_score);
  console.log(`✅ Sorted emails: ${sorted.map(e => `${e.sender} (${e.importance_score})`).join(', ')}`);
  
  return sorted;
}

// Prepare emails for GPT processing
export function prepareEmailsForGPT(emails: ProcessedEmail[]): string {
  const formatted = emails.map((email, index) => {
    let emailInfo = `EMAIL ${index + 1}:
From: ${email.from}
Subject: ${email.subject}
Date: ${email.date.toLocaleDateString()}`;

    // Add forwarding information if available
    if (email.isForwarded) {
      emailInfo += `
Forwarded by: ${email.forwardedBy}`;
      if (email.originalSender) {
        emailInfo += `
Originally from: ${email.originalSender}`;
      }
    }

    emailInfo += `
Content: ${email.body}
---`;

    return emailInfo;
  }).join('\n\n');
  
  // Debug logging to see what content we're sending to GPT
  console.log(`📊 Prepared ${emails.length} emails for GPT (${formatted.length} characters)`);
  
  // Always show debug logging for email content debugging
    console.log('🔍 EMAILS BEING SENT TO GPT:');
    console.log('=' .repeat(60));
    emails.forEach((email, index) => {
      console.log(`EMAIL ${index + 1}:`);
      console.log(`From: ${email.from}`);
      console.log(`Subject: ${email.subject}`);
      if (email.isForwarded) {
        console.log(`🔄 Forwarded by: ${email.forwardedBy}`);
        if (email.originalSender) {
          console.log(`📧 Originally from: ${email.originalSender}`);
        }
      }
      console.log(`Body content: "${email.body}"`);
      console.log(`Body length: ${email.body.length} characters`);
      console.log('-'.repeat(40));
    });
    console.log('=' .repeat(60));
  
  return formatted;
}

// Prepare calendar events for GPT processing  
export function prepareCalendarForGPT(events: ProcessedCalendarEvent[]): string {
  if (events.length === 0) return "No calendar events for today.";
  
  return `TODAY'S CALENDAR EVENTS:
${events.map(event => 
  `• ${event.startTime} - ${event.title} (${event.duration})${event.location ? ` at ${event.location}` : ''}`
).join('\n')}`;
}
