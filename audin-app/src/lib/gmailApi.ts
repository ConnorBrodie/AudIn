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
  return content
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/[ \t]+/g, ' ') // Normalize whitespace
    .replace(/^>.*$/gm, '') // Remove quoted reply lines
    .replace(/^--.*$/gm, '') // Remove signature lines
    .trim()
    .slice(0, 300); // Hard limit to 300 characters for token management
}
