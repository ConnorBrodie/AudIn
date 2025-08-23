import { Email } from '@/types/email';
import { CalendarEvent } from '@/types/calendar';
import { EmailSummary, ProcessedDigest } from '@/types/digest';
import { 
  processEmail, 
  processCalendarEventForPodcast, 
  prepareEmailsForGPT, 
  sortEmailsByUrgency
} from './emailProcessor';
import { processEmailsToJSON, generatePodcastScript, generateAudio } from './openai';

export interface DigestResult {
  emailSummary: string;
  podcastScript: string;
  audioBuffer: ArrayBuffer;
  textDigest: string;
  processedEmails: number;
  processedEvents: number;
  structuredData: ProcessedDigest; // New: structured data for UI
}

// Main AI pipeline orchestrator
export async function generateDigest(
  emails: Email[], 
  calendarEvents: CalendarEvent[],
  voiceId?: string
): Promise<DigestResult> {
  try {
    console.log('🚀 Starting enhanced AudIn digest generation...');
    
    // Step 1: Process raw data for AI input
    console.log('📧 Processing emails for AI analysis...');
    const processedEmails = emails.map(processEmail);
    const emailContent = prepareEmailsForGPT(processedEmails);
    
    console.log('🤖 GPT Call 1: Converting emails to structured JSON...');
    
    // Step 2: GPT Call 1 - Convert emails to structured JSON with urgency scoring
    const emailSummaries = await processEmailsToJSON(emailContent);
    
    console.log(`📊 Processed ${emailSummaries.length} emails with urgency scores`);
    
    // Step 3: Our code - Sort by urgency and process calendar
    const sortedEmails = sortEmailsByUrgency(emailSummaries);
    const calendarSummaries = calendarEvents.map(processCalendarEventForPodcast);
    
    // Step 4: Prepare calendar content for script generation
    const calendarContent = calendarSummaries.length > 0
      ? `TODAY'S CALENDAR EVENTS:\n${calendarSummaries.map(event => 
          `• ${event.time} - ${event.title} (${event.duration})${event.location ? ` at ${event.location}` : ''}`
        ).join('\n')}`
      : "No calendar events for today.";
    
    console.log('🎙️ GPT Call 2: Generating podcast script...');
    
    // Step 5: GPT Call 2 - Generate podcast script from structured data
    const podcastScript = await generatePodcastScript(sortedEmails, calendarContent);
    
    console.log('🔊 OpenAI TTS: Converting to audio...');
    
    // Step 6: Convert to audio
    const audioBuffer = await generateAudio(podcastScript, voiceId);
    
    // Step 7: Create structured data and text digest
    const structuredData: ProcessedDigest = {
      emails: sortedEmails,
      calendar: calendarSummaries,
      total_emails: sortedEmails.length,
      total_events: calendarSummaries.length
    };
    
    const textDigest = createEnhancedTextDigest(sortedEmails, calendarSummaries);
    const emailSummary = formatEmailsForDisplay(sortedEmails, calendarSummaries);
    
    console.log('✅ Enhanced digest generation complete!');
    
    return {
      emailSummary,
      podcastScript,
      audioBuffer,
      textDigest,
      processedEmails: sortedEmails.length,
      processedEvents: calendarSummaries.length,
      structuredData
    };
    
  } catch (error) {
    console.error('❌ Error in digest generation:', error);
    throw error;
  }
}

// Create enhanced text digest from structured data
function createEnhancedTextDigest(sortedEmails: EmailSummary[], calendarSummaries: any[]): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let digest = `# Your Daily Digest - ${today}\n\n## 📧 Emails (Sorted by Urgency)\n\n`;
  
  // Group emails by urgency level for better display
  const urgentEmails = sortedEmails.filter(e => e.urgency_score >= 7);
  const importantEmails = sortedEmails.filter(e => e.urgency_score >= 4 && e.urgency_score < 7);
  const generalEmails = sortedEmails.filter(e => e.urgency_score < 4);

  if (urgentEmails.length > 0) {
    digest += `### ⚡ Urgent (${urgentEmails.length})\n`;
    urgentEmails.forEach(email => {
      digest += `**${email.sender}**: ${email.summary} *(Urgency: ${email.urgency_score}/10)*\n\n`;
    });
  }

  if (importantEmails.length > 0) {
    digest += `### 📬 Important (${importantEmails.length})\n`;
    importantEmails.forEach(email => {
      digest += `**${email.sender}**: ${email.summary} *(Urgency: ${email.urgency_score}/10)*\n\n`;
    });
  }

  if (generalEmails.length > 0) {
    digest += `### 🧠 General (${generalEmails.length})\n`;
    generalEmails.forEach(email => {
      digest += `**${email.sender}**: ${email.summary} *(Urgency: ${email.urgency_score}/10)*\n\n`;
    });
  }

  if (calendarSummaries.length > 0) {
    digest += `## 📅 Today's Calendar\n\n`;
    calendarSummaries.forEach(event => {
      digest += `**${event.time}** - ${event.title} (${event.duration})`;
      if (event.location) digest += ` at ${event.location}`;
      digest += '\n\n';
    });
  }

  digest += `---\n\n*Generated by AudIn - Your Personal Inbox Radio*`;
  return digest;
}

// Format emails for display in dashboard with visual enhancements
function formatEmailsForDisplay(sortedEmails: EmailSummary[], calendarSummaries: any[] = []): string {
  let summary = "📧 Your Day at a Glance\n\n";
  
  // Group emails by urgency level
  const urgentEmails = sortedEmails.filter(e => e.urgency_score >= 7);
  const importantEmails = sortedEmails.filter(e => e.urgency_score >= 4 && e.urgency_score < 7);
  const generalEmails = sortedEmails.filter(e => e.urgency_score < 4);

  // Helper function to get action emoji based on email content
  const getActionEmoji = (summary: string) => {
    const lower = summary.toLowerCase();
    if (lower.includes('meeting') || lower.includes('call')) return '👥';
    if (lower.includes('budget') || lower.includes('money') || lower.includes('$')) return '💰';
    if (lower.includes('deadline') || lower.includes('urgent') || lower.includes('asap')) return '⏰';
    if (lower.includes('approval') || lower.includes('sign')) return '✅';
    if (lower.includes('report') || lower.includes('document')) return '📄';
    if (lower.includes('project') || lower.includes('task')) return '🎯';
    if (lower.includes('issue') || lower.includes('problem') || lower.includes('error')) return '🔥';
    return '📩';
  };

  // Urgent emails
  if (urgentEmails.length > 0) {
    summary += `🚨 URGENT (${urgentEmails.length})\n`;
    urgentEmails.forEach(email => {
      const emoji = getActionEmoji(email.summary);
      summary += `• ${email.sender}: ${email.summary} ${emoji}\n`;
    });
    summary += '\n';
  }

  // Important emails  
  if (importantEmails.length > 0) {
    summary += `📬 IMPORTANT (${importantEmails.length})\n`;
    importantEmails.forEach(email => {
      const emoji = getActionEmoji(email.summary);
      summary += `• ${email.sender}: ${email.summary} ${emoji}\n`;
    });
    summary += '\n';
  }

  // General emails
  if (generalEmails.length > 0) {
    summary += `🧠 GENERAL (${generalEmails.length})\n`;
    generalEmails.forEach(email => {
      const emoji = getActionEmoji(email.summary);
      summary += `• ${email.sender}: ${email.summary} ${emoji}\n`;
    });
    summary += '\n';
  }

  // Calendar events
  if (calendarSummaries.length > 0) {
    summary += `📅 TODAY'S SCHEDULE (${calendarSummaries.length})\n`;
    calendarSummaries.forEach(event => {
      // Get time-based emoji
      const hour = parseInt(event.time.split(':')[0]);
      let timeEmoji = '🕐';
      if (hour >= 6 && hour < 12) timeEmoji = '🌅';
      else if (hour >= 12 && hour < 18) timeEmoji = '☀️';
      else if (hour >= 18 && hour < 22) timeEmoji = '🌇';
      else timeEmoji = '🌙';
      
      // Get event type emoji
      const eventLower = event.title.toLowerCase();
      let eventEmoji = '📅';
      if (eventLower.includes('meeting') || eventLower.includes('call')) eventEmoji = '👥';
      else if (eventLower.includes('lunch') || eventLower.includes('coffee')) eventEmoji = '☕';
      else if (eventLower.includes('presentation')) eventEmoji = '🎯';
      else if (eventLower.includes('interview')) eventEmoji = '💼';
      else if (eventLower.includes('review')) eventEmoji = '📊';
      
      summary += `• ${event.time} - ${event.title} ${timeEmoji}${eventEmoji}\n`;
    });
  }

  return summary;
}

// Helper function for demo mode
export async function generateDemoDigest(voiceId?: string): Promise<DigestResult> {
  // Import mock data dynamically to avoid bundling issues
  const { mockEmails } = await import('@/data/mockEmails');
  const { mockCalendarEvents } = await import('@/data/mockCalendar');
  
  return generateDigest(mockEmails, mockCalendarEvents, voiceId);
}
