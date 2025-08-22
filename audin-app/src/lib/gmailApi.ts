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
    
    for (const message of messages) {
      if (!message.id) continue;
      
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
  
  // Try to get plain text content
  if (payload.body?.data) {
    content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  // If multipart, look for text/plain part
  if (!content && payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        content = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      }
    }
    
    // Fallback to HTML content if no plain text
    if (!content) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // Basic HTML stripping
          content = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
          break;
        }
      }
    }
  }
  
  // Fallback to snippet if no body content found
  if (!content) {
    content = email.snippet || '';
  }
  
  // Clean up the content for GPT processing
  return cleanEmailContent(content);
}

// Advanced email content cleaning to remove signatures, footers, and reply chains
function cleanEmailContent(content: string): string {
  if (!content) return '';
  
  // Skip extremely long emails (likely newsletters/spam) - take first part only
  if (content.length > 3000) {
    console.log(`📧 Email too long (${content.length} chars), taking first 1000 chars only`);
    content = content.substring(0, 1000);
  }
  
  // Split into lines for line-by-line processing
  let lines = content.split('\n');
  
  // Remove quoted reply chains (lines starting with >)
  lines = lines.filter(line => !line.trim().startsWith('>'));
  
  // Find the end of the actual message (before signatures/footers)
  let messageEndIndex = lines.length;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    // More conservative signature markers (less aggressive)
    if (
      line === '--' ||
      line === '-- ' ||
      line.includes('sent from my iphone') ||
      line.includes('sent from my android') ||
      line.includes('get outlook for ios') ||
      line.includes('get outlook for android') ||
      line.includes('confidential and proprietary') ||
      line.includes('if you no longer wish to receive') ||
      line.includes('please consider the environment before printing') ||
      // Only match standalone closing words, not in sentences
      line.match(/^thanks?\s*[,!.]?\s*$/i) ||
      line.match(/^best regards?\s*[,!.]?\s*$/i) ||
      line.match(/^sincerely yours?\s*[,!.]?\s*$/i) ||
      // Copyright only if it's clearly a footer
      (line.includes('©') && line.includes('all rights reserved'))
    ) {
      messageEndIndex = i;
      break;
    }
  }
  
  // Take only the message content (before signatures/footers)
  const messageLines = lines.slice(0, messageEndIndex);
  
  // Remove common email headers/metadata that might appear in body
  const cleanedLines = messageLines.filter(line => {
    const trimmed = line.trim().toLowerCase();
    return !(
      trimmed.startsWith('from:') ||
      trimmed.startsWith('to:') ||
      trimmed.startsWith('sent:') ||
      trimmed.startsWith('date:') ||
      trimmed.startsWith('subject:') ||
      trimmed.startsWith('cc:') ||
      trimmed.startsWith('bcc:') ||
      trimmed.startsWith('reply-to:') ||
      trimmed === '' && messageLines.indexOf(line) < 3 // Remove empty lines at start
    );
  });
  
  // Join back and clean up
  let cleaned = cleanedLines.join('\n')
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/[ \t]+/g, ' ') // Normalize whitespace
    .replace(/&nbsp;/g, ' ') // HTML non-breaking spaces
    .replace(/&amp;/g, '&') // HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
  
  // If the cleaned content is too short, it might have been over-aggressive
  // Fall back to snippet or first few sentences
  if (cleaned.length < 20 && content.length > 50) {
    // Take first 2 sentences if available
    const sentences = content.split(/[.!?]+/);
    if (sentences.length >= 2) {
      cleaned = sentences.slice(0, 2).join('. ').trim() + '.';
    } else {
      cleaned = content.substring(0, 200);
    }
  }
  
  // Reasonable limit for email content - prioritize meaningful content over length
  const final = cleaned.slice(0, 200); // Reduced to 200 characters for better token management
  
  // Debug logging to see content extraction process
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 EMAIL CONTENT EXTRACTION DEBUG:');
    console.log(`Raw content length: ${content.length}`);
    console.log(`Raw content preview: "${content.substring(0, 200)}..."`);
    console.log(`Cleaned content length: ${cleaned.length}`);
    console.log(`Cleaned content: "${cleaned}"`);
    console.log(`Final content (after limit): "${final}"`);
    console.log('---');
  }
  
  return final;
}
