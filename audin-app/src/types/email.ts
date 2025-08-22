// TypeScript interfaces for Gmail API data structures

export interface EmailHeader {
  name: string;
  value: string;
}

export interface EmailBody {
  data: string;
  size?: number;
}

export interface EmailPayload {
  headers: EmailHeader[];
  body: EmailBody;
  mimeType?: string;
}

export interface Email {
  id: string;
  threadId: string;
  snippet: string;
  payload: EmailPayload;
  internalDate: string;
  labelIds?: string[];
}

// Processed email interface for our pipeline
export interface ProcessedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  snippet: string;
  isUnread: boolean;
}
