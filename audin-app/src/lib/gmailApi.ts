import { google } from 'googleapis';
import { Email } from '@/types/email';

// Initialize Gmail API client
export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return google.gmail({ version: 'v1', auth });
}

// Fetch unread emails from Gmail
export async function fetchUnreadEmails(accessToken: string, maxResults: number = 20): Promise<Email[]> {
  try {
    const gmail = getGmailClient(accessToken);
    
    console.log('📧 Fetching unread emails from Primary tab (last 3 days)...');
    
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateString = threeDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Get list of unread email IDs from last 3 days, Primary tab only (no social/promotions/updates)
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread category:primary after:${dateString}`, // Only unread emails from Primary tab, last 3 days
      maxResults: Math.min(maxResults, 8), // Further reduced to 8 emails max
    });

    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      console.log('📭 No unread emails found');
      return [];
    }

    console.log(`📧 Found ${messages.length} unread emails, fetching details...`);

    // Fetch full details for each email
    const emails: Email[] = [];
    const processedIds = new Set<string>();
    
    for (const message of messages) {
      if (!message.id) continue;
      
      // Skip duplicates
      if (processedIds.has(message.id)) {
        console.log(`⚠️ Skipping duplicate email ID: ${message.id}`);
        continue;
      }
      processedIds.add(message.id);
      
      try {
        const emailResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const emailData = emailResponse.data;
        if (emailData) {
          // Convert Gmail API response to our Email type
          const email: Email = {
            id: emailData.id || '',
            threadId: emailData.threadId || '',
            labelIds: emailData.labelIds || [],
            snippet: emailData.snippet || '',
            payload: {
              partId: emailData.payload?.partId || '',
              mimeType: emailData.payload?.mimeType || '',
              filename: emailData.payload?.filename || '',
              headers: emailData.payload?.headers || [],
              body: emailData.payload?.body || { size: 0 },
              parts: emailData.payload?.parts || []
            },
            sizeEstimate: emailData.sizeEstimate || 0,
            historyId: emailData.historyId || '',
            internalDate: emailData.internalDate || ''
          };
          
          emails.push(email);
        }
      } catch (error) {
        console.error(`Error fetching email ${message.id}:`, error);
        // Continue with other emails even if one fails
      }
    }

    console.log(`✅ Successfully fetched ${emails.length} emails`);
    return emails;
    
  } catch (error) {
    console.error('Error fetching Gmail emails:', error);
    throw new Error('Failed to fetch emails from Gmail');
  }
}

// Helper function to extract email content from Gmail API response
export function extractEmailContent(email: Email): string {
  let content = '';
  const { payload } = email;
  
  console.log(`🔍 GMAIL API DEBUG - Email ID: ${email.id}`);
  console.log(`📧 Payload mimeType: ${payload.mimeType}`);
  console.log(`📧 Has direct body data: ${!!payload.body?.data}`);
  console.log(`📧 Body size bytes: ${payload.body?.size || 0}`);
  console.log(`📧 Has parts: ${!!payload.parts}, Parts count: ${payload.parts?.length || 0}`);
  
  // Try to get plain text content
  if (payload.body?.data) {
    content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    console.log(`📧 Got content from direct body: ${content.length} chars`);
  }
  
  // If multipart, look for text/plain part (with recursive search)
  if (!content && payload.parts) {
    console.log(`📧 Searching through ${payload.parts.length} parts...`);
    content = searchPartsRecursively(payload.parts, 0);
  }
  
  // Fallback to snippet if no body content found
  if (!content) {
    console.log(`📧 No body content found, using snippet: ${email.snippet?.length || 0} chars`);
    content = email.snippet || '';
  }
  
  console.log(`📧 FINAL RAW CONTENT LENGTH: ${content.length} chars`);
  // Content preview removed for security
  
  // Clean up the content for GPT processing
  return cleanEmailContent(content);
}

// Recursive function to search through nested multipart structures
function searchPartsRecursively(parts: any[], depth: number): string {
  const indent = '  '.repeat(depth);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    console.log(`📧 ${indent}Part ${i}: mimeType=${part.mimeType}, hasData=${!!part.body?.data}, size=${part.body?.size || 0}`);
    
    // Check for text/plain content
    if (part.mimeType === 'text/plain' && part.body?.data) {
      const content = Buffer.from(part.body.data, 'base64').toString('utf-8');
      console.log(`📧 ${indent}✅ Found text/plain content: ${content.length} chars`);
      return content;
    }
    
    // If this part has nested parts, search recursively
    if (part.parts && part.parts.length > 0) {
      console.log(`📧 ${indent}🔍 Searching ${part.parts.length} nested parts...`);
      const nestedContent = searchPartsRecursively(part.parts, depth + 1);
      if (nestedContent) {
        return nestedContent;
      }
    }
  }
  
  // If no text/plain found, try HTML as fallback
  console.log(`📧 ${indent}No text/plain found, trying HTML...`);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.mimeType === 'text/html' && part.body?.data) {
      const htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
      console.log(`📧 ${indent}✅ Found HTML content: ${htmlContent.length} chars`);
      // Basic HTML stripping
      const content = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      console.log(`📧 ${indent}After HTML stripping: ${content.length} chars`);
      return content;
    }
    
    // Search nested parts for HTML too
    if (part.parts && part.parts.length > 0) {
      const nestedContent = searchPartsRecursively(part.parts, depth + 1);
      if (nestedContent) {
        return nestedContent;
      }
    }
  }
  
  return '';
}

// Minimal email content cleaning - preserve ALL actual content
function cleanEmailContent(content: string): string {
  if (!content) return '';
  
  console.log('🔍 EMAIL CONTENT EXTRACTION DEBUG:');
  console.log(`Raw content length: ${content.length}`);
  // Content preview removed for security
  
  // Skip extremely long emails (likely newsletters/spam) - take first part only
  if (content.length > 5000) {
    console.log(`📧 Email too long (${content.length} chars), taking first 2000 chars only`);
    content = content.substring(0, 2000);
  }
  
  let cleaned = content;
  
  // NO PROCESSING AT ALL - completely raw content
  
  console.log(`Cleaned content length: ${cleaned.length}`);
  // Content preview removed for security
  
  // Apply simple character limit - no complex truncation logic
  const targetLimit = 1200; // Increased from 800 to allow more content
  if (cleaned.length > targetLimit) {
    cleaned = cleaned.substring(0, targetLimit);
  }
  
  console.log(`Final content length: ${cleaned.length} chars`);
  console.log('---');
  
  return cleaned;
}
