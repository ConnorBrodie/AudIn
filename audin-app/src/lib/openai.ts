import OpenAI from 'openai';
import { EmailSummary, EmailProcessingResponse } from '@/types/digest';

// Initialize OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.');
  }

  return new OpenAI({
    apiKey: apiKey,
  });
}

// GPT Call 1: Process emails into structured JSON with urgency scoring
export async function processEmailsToJSON(emailContent: string): Promise<EmailSummary[]> {
  const openai = getOpenAIClient();

  const prompt = `Analyze the following emails and convert them to structured JSON format.

For each email, provide:
- sender: Clean sender name (no email addresses)
- subject: Email subject line
- summary: 1-2 sentence summary of key points and actions needed
- category: "urgent", "important", or "general" 
- urgency_score: Rate 1-10 based on urgency criteria below
- deadline_iso: ISO date if deadline mentioned (optional)

URGENCY SCORING CRITERIA:
- 10: Same-day deadline, critical approvals, emergency
- 8-9: This week deadline, important meetings, time-sensitive decisions  
- 6-7: Next week deadline, significant updates, important but not urgent
- 4-5: General work updates, announcements, moderate importance
- 1-3: Newsletters, social media, personal emails, low priority

CATEGORY ASSIGNMENT:
- urgent: scores 7-10
- important: scores 4-6  
- general: scores 1-3

Return ONLY a JSON array with no additional text:

${emailContent}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert email assistant that converts emails to structured JSON. Always return valid JSON array format with no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1, // Very deterministic for JSON output
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from GPT');
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(response);
      // Handle both direct array and wrapped object responses
      const emails = Array.isArray(parsed) ? parsed : parsed.emails || [];
      
      // Validate structure
      if (!Array.isArray(emails)) {
        throw new Error('Response is not an array');
      }

      return emails as EmailSummary[];
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to parse email processing response as JSON');
    }

  } catch (error) {
    console.error('Error processing emails:', error);
    throw new Error('Failed to process emails. Please try again.');
  }
}

// GPT Call 2: Generate podcast script from structured data
export async function generatePodcastScript(sortedEmails: EmailSummary[], calendarEvents: string): Promise<string> {
  const openai = getOpenAIClient();

  // Format emails by urgency for prompt
  const emailsByUrgency = sortedEmails.map((email, index) => 
    `${index + 1}. ${email.sender}: ${email.summary} (Urgency: ${email.urgency_score}/10)`
  ).join('\n');

  const prompt = `You are an expert podcast scriptwriter who creates short, personal daily briefings, based on their unread emails and calendar events. 
Write a natural, conversational 2-minute podcast script (about 320 ± 30 words) for a professional. 
The script should flow smoothly when spoken aloud, using short sentences, clear transitions, and a warm, professional tone — like a friendly assistant. 
Avoid robotic phrasing.

EMAILS (already sorted by urgency, highest first):
${emailsByUrgency}

CALENDAR:
${calendarEvents}

SCRIPT REQUIREMENTS:
- If there are 3 or less total events (emails + calendar), then aim for 1 minute duration
- Warm, professional tone like a personal assistant
- Cover ALL emails in urgency order (highest urgency first)
- Then cover calendar events chronologically  
- Use short sentences for better speech rhythm
- IMPORTANT: Avoid robotic/repetitive phrasing
- NEVER mention the urgency score of any email or calendar event
- Use the word 'You' often, phrasing it like you are addressing the user directly
- Feel free to occasionallyadd your own comments and thoughts about email/calendar events if anything stands out
- Add natural pause tokens: [PAUSE:short] and [PAUSE:long]
Use casual podcast language: "You've got...", "Quick heads up...", "Looking at your day...", "Moving on to...", "That’s your morning brief — you’re set to go."
- No AM/PM - just say "two-thirty", "nine", "four forty-five"
- Target ~300-350 words for 2-minute duration
- Start with greeting + overall comment about how busy the day is looking
- End with encouraging sign-off
PROSODY & PRONUNCIATION RULES:
- Use natural punctuation for rhythm: commas for short pauses, em dashes — for emphasis, ellipses … for breaths or hesitation.
- Convert [PAUSE:short] → a comma; [PAUSE:long] → paragraph break (blank line).
- Vary sentence length; avoid 3+ short sentences in a row.
- Use occasional conversational cues (e.g., “Alright,” “Okay,” “So,”) but no more than 1 every 3–4 sentences.
- Write contractions (I’m, you’re, it’s).
- Numbers: write in words for times and small numbers (“two-thirty”, “nine”, “four forty-five”).
- Acronyms: if you want them spelled out, write with spaces, e.g., “A I”; otherwise write the actual word (“AI”).
- Names/brands with tricky pronunciation: include a phonetic hint the **first time only** in parentheses, e.g., “Caoimhe (KEE-va)”.
- Stage directions allowed sparingly, inline in parentheses to influence tone: (warm), (brighter), (matter-of-fact), (quick smile).
PROSODY & TTS OPTIMIZATION RULES:
- Use commas for short breaths, em dashes — for emphasis, and ellipses … for brief hesitation
- Paragraph breaks between major sections (emails → calendar) trigger longer natural pauses
- Prefer punctuation TTS engines understand: commas, periods, em dashes, ellipses
- Avoid overusing semicolons or colons (they sound flat in TTS)
- Vary sentence length to avoid monotone delivery; mix short punchy statements with flowing longer ones
- Use contractions naturally (I'm, you're, it's, there's) for conversational flow  
- Write numbers as words for times: "two-thirty", "nine", "four forty-five" (never "2:30 PM")
- For tricky names/brands: include phonetic hint first time only, e.g., "Caoimhe (KEE-va)"
- Stage directions sparingly in parentheses: (warm), (brighter), (matter-of-fact), (energetic)
- Use conversational starters but don't overdo: "Alright," "So," "Now," (max 1 per 3-4 sentences)
- Emphasis with em dashes: "This deadline — tomorrow — needs your attention"


PAUSE GUIDELINES:
- [PAUSE:short] after introducing topics, between related items
- [PAUSE:long] when transitioning between major sections (emails → calendar)

STRUCTURE:
1. Greeting [PAUSE:short]
2. Email briefing (urgency order) [PAUSE:long] 
3. Calendar overview (chronological) [PAUSE:short]
4. Encouraging closing

Your output will be the exact script, no other text. It will be read by a TTS engine, so make sure it is formatted correctly for TTS.

Generate the script now:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert podcast scriptwriter who specializes in creating short, personal daily briefings. 
Your scripts must sound natural, conversational, and easy to follow when spoken aloud. 
You write in a warm, professional style that feels like a friendly assistant — never robotic. 
You balance brevity with flow, using short sentences and smooth transitions. 
You insert strategic pause markers ([PAUSE:short], [PAUSE:long]) to improve TTS rhythm and emphasis. 
Your output should always read like a polished, human-delivered morning podcast.`

        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.6, // More creative for script generation
    });

    return completion.choices[0].message.content || "Failed to generate podcast script.";
  } catch (error) {
    console.error('Error generating podcast script:', error);
    throw new Error('Failed to generate podcast script. Please try again.');
  }
}

// Smart TTS: Use best available provider (ElevenLabs or OpenAI)
export async function generateAudio(script: string, voiceId?: string): Promise<ArrayBuffer> {
  try {
    const { getTTSProvider } = await import('./ttsProviders');
    const ttsProvider = getTTSProvider();
    
    console.log(`🎧 Using ${ttsProvider.name} for audio generation`);
    
    return await ttsProvider.generateAudio(script, voiceId);
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
