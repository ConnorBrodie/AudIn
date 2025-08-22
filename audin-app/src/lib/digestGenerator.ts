import { fetchUnreadEmails, extractEmailContent } from './gmailApi';
import { fetchTodaysEvents } from './calendarApi';
import { processEmail, processCalendarEventForPodcast, sortEmailsByUrgency, prepareEmailsForGPT } from './emailProcessor';
import { processEmailsToJSON, generatePodcastScript } from './openai';
import { getTTSProvider } from './ttsProviders';
import { ProcessedDigest } from '@/types/digest';

// Generate digest from real Gmail and Calendar data
export async function generateOAuthDigest(accessToken: string, voiceId?: string): Promise<{
  audioBuffer: ArrayBuffer;
  script: string;
  digest: ProcessedDigest;
}> {
  console.log('🔐 Generating OAuth digest...');
  
  try {
    // 1. Fetch real data from APIs
    console.log('📡 Fetching data from Gmail and Calendar...');
    const [emails, calendarEvents] = await Promise.all([
      fetchUnreadEmails(accessToken, 8), // Fetch up to 8 unread emails from Primary tab, last 3 days
      fetchTodaysEvents(accessToken)
    ]);

    console.log(`📧 Found ${emails.length} unread emails`);
    console.log(`📅 Found ${calendarEvents.length} calendar events`);

    // 2. Process emails into a format suitable for GPT
    const processedEmails = emails.map(email => {
      const processed = processEmail(email);
      const content = extractEmailContent(email);
      return {
        ...processed,
        content: content // Content is already cleaned and limited in extractEmailContent
      };
    });

    const emailContent = prepareEmailsForGPT(processedEmails);

    // 3. Process calendar events
    const processedCalendarEvents = calendarEvents.map(event => 
      processCalendarEventForPodcast(event)
    );

    // 4. GPT Call 1: Process emails to structured JSON
    console.log('🤖 Processing emails with GPT...');
    const emailSummaries = await processEmailsToJSON(emailContent);
    
    // 5. Sort by urgency and prepare for script generation
    const sortedEmails = sortEmailsByUrgency(emailSummaries);
    
    // Format calendar events for script generation
    const calendarContent = processedCalendarEvents.length > 0 
      ? processedCalendarEvents.map(event => 
          `${event.title} at ${event.time}${event.duration ? ` (${event.duration})` : ''}${event.location ? ` in ${event.location}` : ''}`
        ).join('\n')
      : 'No events scheduled for today';

    // 6. GPT Call 2: Generate podcast script
    console.log('🎙️ Generating podcast script...');
    const script = await generatePodcastScript(sortedEmails, calendarContent);
    
    // 7. Generate audio with TTS
    console.log('🔊 Converting script to audio...');
    const ttsProvider = getTTSProvider();
    const audioBuffer = await ttsProvider.generateAudio(script, voiceId);
    
    // 8. Prepare digest summary
    const digest: ProcessedDigest = {
      emails: emailSummaries,
      calendar: processedCalendarEvents,
      total_emails: emails.length,
      total_events: calendarEvents.length
    };

    console.log('✅ OAuth digest generated successfully!');
    
    return {
      audioBuffer,
      script,
      digest
    };

  } catch (error) {
    console.error('❌ Error generating OAuth digest:', error);
    throw new Error(`Failed to generate digest: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if user is in OAuth mode or demo mode
export function isOAuthMode(): boolean {
  if (typeof window === 'undefined') return false;
  return !sessionStorage.getItem('audin-demo-mode');
}

// Get the appropriate mode for the generate-digest API
export function getDigestMode(): 'oauth' | 'demo' {
  return isOAuthMode() ? 'oauth' : 'demo';
}
