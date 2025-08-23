// Enhanced types for structured AI pipeline

export interface EmailSummary {
  sender: string;
  subject: string;
  summary: string;
  category: "urgent" | "important" | "general";
  importance_score: number; // 1-10, AI-determined
  deadline_iso?: string; // ISO format if deadline detected
  // Forwarding information (optional)
  is_forwarded?: boolean;
  forwarded_by?: string;
  original_sender?: string;
}

export interface CalendarSummary {
  title: string;
  time: string; // Natural format: "two-thirty", "nine", "four forty-five"
  duration: string;
  attendees?: string[];
  location?: string;
}

export interface ProcessedDigest {
  emails: EmailSummary[];
  calendar: CalendarSummary[];
  total_emails: number;
  total_events: number;
}

// GPT response format for email processing
export interface EmailProcessingResponse {
  emails: EmailSummary[];
  processing_notes?: string;
}
