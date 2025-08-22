import { Email } from '@/types/email';

export const mockEmails: Email[] = [
  {
    id: "email_001",
    threadId: "thread_001",
    snippet: "Hi there, I need your approval on the Q4 budget proposal. The deadline is today at 5 PM...",
    payload: {
      headers: [
        { name: "From", value: "Sarah Johnson <sarah.johnson@company.com>" },
        { name: "To", value: "user@company.com" },
        { name: "Subject", value: "URGENT: Q4 Budget Approval Needed" },
        { name: "Date", value: "Wed, 15 Jan 2025 09:30:00 -0800" }
      ],
      body: {
        data: "Hi there,\n\nI need your approval on the Q4 budget proposal. The deadline is today at 5 PM and we can't proceed without your sign-off.\n\nThe proposal covers:\n- Marketing campaigns: $50k\n- Product development: $75k\n- Operations: $25k\n\nPlease review and let me know ASAP.\n\nThanks,\nSarah"
      }
    },
    internalDate: "1737825000000",
    labelIds: ["UNREAD", "INBOX"]
  },
  {
    id: "email_002", 
    threadId: "thread_002",
    snippet: "Reminder: Client presentation meeting today at 2 PM. Please review the attached slides...",
    payload: {
      headers: [
        { name: "From", value: "Mike Chen <mike.chen@company.com>" },
        { name: "To", value: "user@company.com" },
        { name: "Subject", value: "Meeting Reminder: Client Presentation Today" },
        { name: "Date", value: "Wed, 15 Jan 2025 08:45:00 -0800" }
      ],
      body: {
        data: "Hi,\n\nJust a quick reminder about our client presentation meeting today at 2 PM.\n\nPlease review the attached slides and be prepared to discuss:\n- Project timeline updates\n- Budget considerations\n- Next quarter deliverables\n\nSee you there!\nMike"
      }
    },
    internalDate: "1737822300000",
    labelIds: ["UNREAD", "INBOX"]
  },
  {
    id: "email_003",
    threadId: "thread_003", 
    snippet: "Weekly Team Newsletter - Project updates, new hires, and upcoming events...",
    payload: {
      headers: [
        { name: "From", value: "Team Updates <no-reply@company.com>" },
        { name: "To", value: "user@company.com" },
        { name: "Subject", value: "Weekly Team Newsletter - January 15, 2025" },
        { name: "Date", value: "Wed, 15 Jan 2025 07:00:00 -0800" }
      ],
      body: {
        data: "Weekly Team Newsletter\n\nProject Updates:\n- Product launch moved to February 1st\n- New design system implementation 80% complete\n- Backend migration scheduled for next week\n\nNew Team Members:\n- Welcome Jessica Liu, Senior Designer\n- Welcome David Park, Backend Engineer\n\nUpcoming Events:\n- All-hands meeting Friday 2 PM\n- Team happy hour next Thursday\n\nBest regards,\nHR Team"
      }
    },
    internalDate: "1737815700000",
    labelIds: ["UNREAD", "INBOX"]
  },
  {
    id: "email_004",
    threadId: "thread_004",
    snippet: "Your benefits enrollment deadline is January 31st. Don't forget to make your selections...",
    payload: {
      headers: [
        { name: "From", value: "HR Benefits <hr@company.com>" },
        { name: "To", value: "user@company.com" },
        { name: "Subject", value: "Reminder: Benefits Enrollment Deadline January 31st" },
        { name: "Date", value: "Tue, 14 Jan 2025 16:30:00 -0800" }
      ],
      body: {
        data: "Hello,\n\nThis is a friendly reminder that the benefits enrollment deadline is January 31st.\n\nPlease log into the benefits portal to:\n- Review your current selections\n- Make changes for the new year\n- Add or remove dependents\n- Select your HSA contribution amount\n\nIf you need assistance, please contact HR.\n\nBest,\nHR Team"
      }
    },
    internalDate: "1737759000000",
    labelIds: ["UNREAD", "INBOX"]
  },
  {
    id: "email_005",
    threadId: "thread_005",
    snippet: "You have 3 new connection requests and 2 messages waiting for you on LinkedIn...",
    payload: {
      headers: [
        { name: "From", value: "LinkedIn <noreply@linkedin.com>" },
        { name: "To", value: "user@company.com" },
        { name: "Subject", value: "You have pending invitations and messages" },
        { name: "Date", value: "Tue, 14 Jan 2025 15:20:00 -0800" }
      ],
      body: {
        data: "Hi there,\n\nYou have some activity waiting for you on LinkedIn:\n\n• 3 new connection requests\n• 2 unread messages\n• 5 profile views this week\n• Your post about AI trends received 12 likes\n\nStay connected with your professional network!\n\nBest,\nThe LinkedIn Team"
      }
    },
    internalDate: "1737754800000",
    labelIds: ["UNREAD", "INBOX"]
  }
];
