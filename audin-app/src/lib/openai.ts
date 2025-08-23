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
- sender: Clean sender name (no email addresses). For regular emails, use sender name. For forwarded emails, use the name of the person who forwarded it.
- subject: Email subject line
- summary: Detailed summary focusing on the EMAIL BODY CONTENT. Use 2-3 sentences for most emails, up to 4 sentences for complex ones with multiple topics. Include specific details, numbers, dates, actions, and key context. Extract meaningful information from the content provided. Avoid repetition - don't restate the same information multiple times. For forwarded emails, mention that it was forwarded if relevant to context. ALWAYS mention an email was forwarded if it was forwarded. NEVER use phrases like "It likely contains" or "It may contain" - only summarize what is actually in the email content.
- category: "urgent", "important", or "general" 
- importance_score: Rate 1-10 based on importance criteria below
- deadline_iso: ISO date if deadline mentioned (optional)
- is_forwarded: true if email was forwarded, false otherwise
- forwarded_by: Name of person who forwarded (only if is_forwarded is true)
- original_sender: Name of original sender (only if is_forwarded is true and detectable)

IMPORTANCE SCORING CRITERIA:
- 10: Critical decisions, emergencies, same-day deadlines, CEO/senior leadership communications
- 8-9: Important deadlines (this week), client communications, project approvals, meeting changes
- 6-7: Significant updates, next week deadlines, team communications, valuable opportunities
- 4-5: Regular work updates, announcements, routine communications, moderate significance
- 1-3: Newsletters, social media, personal emails, low-priority notifications

CATEGORY ASSIGNMENT:
- urgent: scores 7-10 (high importance - needs immediate attention)
- important: scores 4-6 (moderate importance - should be addressed)
- general: scores 1-3 (low importance - can be reviewed later)

SUMMARY LENGTH RULES:
- SIMPLE emails (meeting requests, quick questions, brief updates) = 2 sentences minimum
- COMPLEX emails (detailed proposals, multiple topics, financial info) = 3-4 sentences
- NEWSLETTERS = 2-3 key topics mentioned with context

EXAMPLES:
Simple: "Steven wants to meet at 11 to discuss the budget. He needs your input on the Q3 spending adjustments before finalizing the proposal."
Complex: "Q4 budget approval needed by Friday for $50,000 marketing campaign. Meeting at 3 PM to discuss allocation across digital ads and events. The campaign targets new demographics and requires board approval before implementation."

GUIDELINES:
- Prioritize EMAIL BODY CONTENT when meaningful and complete
- When body content is incomplete, unclear, or just forwarding headers, use the SUBJECT LINE to understand what the email is about
- Include specific details: amounts, dates, times, names, actions
- NO REPETITION - don't restate the same information multiple ways
- Each sentence must add NEW information, not repeat what was already said

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
      max_tokens: 3000, // Increased for more detailed summaries with expanded content
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
export async function generatePodcastScript(sortedEmails: EmailSummary[], calendarEvents: string, digestMode: 'morning' | 'evening' = 'morning'): Promise<string> {
  const openai = getOpenAIClient();

  // Format emails by importance for prompt
  const emailsByImportance = sortedEmails.map((email, index) => 
    `${index + 1}. ${email.sender}: ${email.summary} (Importance: ${email.importance_score}/10)`
  ).join('\n');
  
  // Debug logging to see what content is being sent to GPT
  console.log('📝 EMAILS FORMATTED FOR SCRIPT GENERATION:');
  console.log(`📊 Processing ${sortedEmails.length} emails with ${emailsByImportance.length} total characters`);

  // Generate mode-specific opening and context
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday
  const isFriday = dayOfWeek === 5;
  const isWeekend = dayOfWeek === 6 || dayOfWeek === 0; // Saturday or Sunday
  
  const getModeContext = () => {
    if (digestMode === 'morning') {
      return {
        opening: 'Good morning! Here\'s your inbox briefing to start the day strong...',
        tone: 'Energetic, preparatory, action-oriented',
        emailFraming: 'You have [number] urgent emails that need attention today',
        calendarFraming: 'Your schedule today includes... / Your first meeting is at...',
        closing: 'You\'ve got this! Let\'s make it a productive day.',
        scriptType: 'energizing morning briefings based on unread emails and today\'s calendar events',
        audience: 'a professional starting their day',
        assistantTone: 'an enthusiastic personal assistant'
      };
    } else {
      // Evening mode
      let calendarFraming = 'Tomorrow you have...';
      let specialInstructions = '';
      
      if (isFriday) {
        calendarFraming = 'For the weekend and Monday...';
        specialInstructions = '\nSPECIAL FRIDAY INSTRUCTIONS: Mention weekend events first, then Monday prep. Frame as "This weekend... and Monday you\'ll need to..."';
      } else if (isWeekend) {
        calendarFraming = 'Monday starts with...';
        specialInstructions = '\nWEEKEND INSTRUCTIONS: Focus on Monday prep since it\'s the weekend.';
      }
      
      return {
        opening: 'Let\'s wrap up the day and prep for what\'s ahead...',
        tone: 'Reflective, wind-down, tomorrow-prep focused',
        emailFraming: 'You have [number] emails from today that still need responses / Here\'s what\'s still pending from today',
        calendarFraming,
        closing: 'That\'s your wrap-up. Rest well and you\'re all set for what\'s ahead.',
        scriptType: 'reflective evening recaps based on unread emails from today and upcoming calendar events',
        audience: 'a professional wrapping up their day',
        assistantTone: 'a thoughtful personal assistant',
        specialInstructions
      };
    }
  };

  const modeContext = getModeContext();

  const prompt = `You are an expert podcast scriptwriter who creates ${modeContext.scriptType}. 
Write a natural, conversational 2-minute podcast script (about 320 ± 30 words) for ${modeContext.audience}. 
The script should flow smoothly when spoken aloud, using short sentences, clear transitions, and ${modeContext.tone.toLowerCase()} tone — like ${modeContext.assistantTone}. 

STYLE GUIDE:
- OPENING: ${modeContext.opening}
- TONE: ${modeContext.tone}
- EMAIL FRAMING: ${modeContext.emailFraming}
- CALENDAR FRAMING: ${modeContext.calendarFraming}
- CLOSING: ${modeContext.closing}${modeContext.specialInstructions || ''}

EMAILS (already sorted by importance, highest first):
${emailsByImportance}

CALENDAR:
${calendarEvents}

SCRIPT REQUIREMENTS:
- If there are 3 or less total events (emails + calendar), then aim for 1 minute duration
- Warm, professional tone like a personal assistant
- Cover ALL emails in importance order (highest importance first) - EVERY SINGLE EMAIL MUST BE MENTIONED
- Then cover calendar events chronologically  
- Use short sentences for better speech rhythm
- IMPORTANT: Avoid robotic/repetitive phrasing
- Only use the importance score to guide your language - call something urgent only if it's truly high importance (7-10)
- NEVER mention the importance score of any email or calendar event  
- IMPORTANT: NEVER mention the number of urgent/important emails
- Use the word 'You' often, phrasing it like you are addressing the user directly
- Feel free to occasionally add your own comments and thoughts about email/calendar events if anything stands out
- Add natural pause tokens: [PAUSE:short] and [PAUSE:long]
- If you notice that two emails are related, or an email is related to a calendar event, you can mention this in the script
- MINIMUM EMAIL COVERAGE: Each email must get at least 2 sentences in the script - one to introduce the sender/topic, and another with details or action needed
- FORWARDED EMAILS: When an email was forwarded, ALWAYS mention the fact that it was forwardeded.
Use casual podcast language: "You've got...", "Quick heads up...", "Looking at your day...", "Moving on to...", "That's your morning brief — you're set to go."
- TIME FORMAT: Use natural spoken format - "three", "nine", "two-thirty", "four forty-five". NEVER use "3:00" format. For times with :00, just say the hour (e.g., "three" not "three o'clock"). Add "am" or "pm" only when necessary for clarity.
- ACRONYMS: Spell out all acronyms letter by letter for TTS (e.g., "A E S T" not "AEST", "U S A" not "USA", "C E O" not "CEO")
- Target ~300-350 words for 2-minute duration
- Start with greeting + overall comment about how busy the day is looking
- End with encouraging sign-off
PROSODY & PRONUNCIATION RULES:
- Use natural punctuation for rhythm: commas for short pauses, em dashes — for emphasis, ellipses … for breaths or hesitation.
- Convert [PAUSE:short] → a comma; [PAUSE:long] → paragraph break (blank line).
- Vary sentence length; avoid 3+ short sentences in a row.
- Use occasional conversational cues (e.g., “Alright,” “Okay,” “So,”) but no more than 1 every 3–4 sentences.
- Write contractions (I’m, you’re, it’s).
- Numbers: write in words for times and small numbers ("two-thirty", "nine", "four forty-five"). NEVER use numeric format like "3:00".
- Acronyms: ALWAYS spell out with spaces for clear pronunciation, e.g., "A E S T", "U S A", "C E O", "A I".
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
- [PAUSE:short] for natural breaths between topics or items
- [PAUSE:long] SPARINGLY - only for major section transitions (emails → calendar). Use max 1-2 per script.

STRUCTURE:
1. Greeting [PAUSE:short]
2. Email briefing (importance order - highest first) - MUST cover every single email provided [PAUSE:long] 
3. Calendar overview (chronological) [PAUSE:short]
4. Encouraging closing

EMAIL COVERAGE EXAMPLE:
For each email, use this pattern:
"Sarah from marketing sent you an update about the campaign. [PAUSE:short] She needs your approval on the budget changes by tomorrow and wants to schedule a quick call to discuss the timeline."

PAUSE USAGE EXAMPLE:
"Good morning! [PAUSE:short] You have three urgent emails today. [PAUSE:short] First, Sarah from marketing sent you an update about the campaign. [PAUSE:short] She needs your approval on the budget changes by tomorrow. [PAUSE:long] Moving on to your calendar..."

TIME & ACRONYM EXAMPLES:
❌ WRONG: "Meeting at 3:00 PM EST" 
✅ RIGHT: "Meeting at three pm E S T"
❌ WRONG: "CEO sent an update at 9:15 AM"
✅ RIGHT: "C E O sent an update at nine fifteen am"

NEVER reduce an email to just one sentence like: "Sarah needs budget approval." Always provide the context and details in at least 2 sentences.

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
Your output should always read like a polished, human-delivered morning podcast.

CRITICAL RULE: Every single email must receive a minimum of 2 sentences in your script:
- Sentence 1: Introduce the sender and main topic
- Sentence 2: Provide specific details, context, or action needed
This ensures comprehensive coverage and prevents any email from being glossed over.

CONTENT PRIORITIZATION: When email body content is incomplete or unclear (forwarding headers, newsletter HTML, etc.), use the subject line to understand what the email is about and provide meaningful commentary.`

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
