import { Email } from '@/types/email';
import { CalendarEvent } from '@/types/calendar';

export interface DemoPreset {
  name: string;
  description: string;
  emails: Email[];
  calendar: CalendarEvent[];
}

export const demoPresets: DemoPreset[] = [
  {
    name: "Default",
    description: "Balanced mix of urgent and routine items",
    emails: [
      {
        id: "email_001",
        threadId: "thread_001",
        snippet: "Hi there, I need your approval on the Q4 budget proposal...",
        payload: {
          headers: [
            { name: "From", value: "Sarah Johnson <sarah.johnson@company.com>" },
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
        snippet: "Reminder: Client presentation meeting today at 2 PM...",
        payload: {
          headers: [
            { name: "From", value: "Mike Chen <mike.chen@company.com>" },
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
        snippet: "Weekly Team Newsletter - Project updates and announcements...",
        payload: {
          headers: [
            { name: "From", value: "Team Updates <no-reply@company.com>" },
            { name: "Subject", value: "Weekly Team Newsletter - January 15, 2025" },
            { name: "Date", value: "Wed, 15 Jan 2025 07:00:00 -0800" }
          ],
          body: {
            data: "Weekly Team Newsletter\n\nProject Updates:\n- Product launch moved to February 1st\n- New design system implementation 80% complete\n- Backend migration scheduled for next week\n\nNew Team Members:\n- Welcome Jessica Liu, Senior Designer\n- Welcome David Park, Backend Engineer\n\nUpcoming Events:\n- All-hands meeting Friday 2 PM\n- Team happy hour next Thursday"
          }
        },
        internalDate: "1737815700000",
        labelIds: ["UNREAD", "INBOX"]
      }
    ],
    calendar: [
      {
        id: "event_001",
        summary: "Team Standup",
        start: { dateTime: "2025-01-15T09:00:00-08:00" },
        end: { dateTime: "2025-01-15T09:30:00-08:00" },
        attendees: [{ email: "team@company.com", displayName: "Development Team" }],
        status: "confirmed"
      },
      {
        id: "event_002",
        summary: "Client Presentation Meeting",
        start: { dateTime: "2025-01-15T14:00:00-08:00" },
        end: { dateTime: "2025-01-15T15:00:00-08:00" },
        attendees: [{ email: "mike.chen@company.com", displayName: "Mike Chen" }],
        location: "Conference Room A",
        status: "confirmed"
      }
    ]
  },
  {
    name: "Busy Day",
    description: "High-urgency day with multiple deadlines and meetings",
    emails: [
      {
        id: "email_busy_001",
        threadId: "thread_busy_001",
        snippet: "URGENT: Server outage affecting production systems...",
        payload: {
          headers: [
            { name: "From", value: "DevOps Alert <alerts@company.com>" },
            { name: "Subject", value: "🚨 CRITICAL: Production Server Down" },
            { name: "Date", value: "Wed, 15 Jan 2025 10:15:00 -0800" }
          ],
          body: {
            data: "CRITICAL ALERT\n\nProduction servers are experiencing a major outage since 10:00 AM.\n\n• Customer login system down\n• Payment processing affected\n• 500+ error reports received\n\nImmediate action required. War room convened in 15 minutes.\n\nEstimated customer impact: 50,000+ users"
          }
        },
        internalDate: "1737827700000",
        labelIds: ["UNREAD", "INBOX"]
      },
      {
        id: "email_busy_002", 
        threadId: "thread_busy_002",
        snippet: "Board presentation deadline moved to TODAY 4 PM...",
        payload: {
          headers: [
            { name: "From", value: "CEO Office <ceo@company.com>" },
            { name: "Subject", value: "URGENT: Board Presentation Due Today" },
            { name: "Date", value: "Wed, 15 Jan 2025 09:45:00 -0800" }
          ],
          body: {
            data: "Team,\n\nDue to schedule changes, the board presentation is now due TODAY at 4 PM instead of Friday.\n\nRequired updates:\n- Q4 financial review\n- 2025 roadmap slides\n- Customer growth metrics\n\nThis is non-negotiable. Please prioritize immediately.\n\nThanks,\nExecutive Team"
          }
        },
        internalDate: "1737825900000",
        labelIds: ["UNREAD", "INBOX"]
      },
      {
        id: "email_busy_003",
        threadId: "thread_busy_003",
        snippet: "Major client threatening to cancel contract...",
        payload: {
          headers: [
            { name: "From", value: "Sales Team <sales@company.com>" },
            { name: "Subject", value: "URGENT: ABC Corp Contract Risk" },
            { name: "Date", value: "Wed, 15 Jan 2025 08:30:00 -0800" }
          ],
          body: {
            data: "URGENT\n\nABC Corp (our largest client - $2M contract) is threatening to cancel due to recent service issues.\n\nThey want a response by EOD with:\n- Root cause analysis\n- Compensation proposal\n- Service improvement plan\n\nThis could be a major revenue hit. Need all hands on deck.\n\nCall scheduled for 3 PM today."
          }
        },
        internalDate: "1737822000000",
        labelIds: ["UNREAD", "INBOX"]
      }
    ],
    calendar: [
      {
        id: "event_busy_001",
        summary: "🚨 Emergency War Room - Server Outage",
        start: { dateTime: "2025-01-15T10:30:00-08:00" },
        end: { dateTime: "2025-01-15T12:00:00-08:00" },
        attendees: [{ email: "devops@company.com", displayName: "DevOps Team" }],
        location: "Conference Room A + Zoom",
        status: "confirmed"
      },
      {
        id: "event_busy_002",
        summary: "ABC Corp Crisis Call",
        start: { dateTime: "2025-01-15T15:00:00-08:00" },
        end: { dateTime: "2025-01-15T16:00:00-08:00" },
        attendees: [{ email: "sales@company.com", displayName: "Sales Team" }],
        location: "Executive Conference Room",
        status: "confirmed"
      },
      {
        id: "event_busy_003",
        summary: "Board Presentation Prep",
        start: { dateTime: "2025-01-15T13:00:00-08:00" },
        end: { dateTime: "2025-01-15T14:30:00-08:00" },
        attendees: [{ email: "executives@company.com", displayName: "Executive Team" }],
        location: "CEO Office",
        status: "confirmed"
      },
      {
        id: "event_busy_004",
        summary: "Board Presentation Delivery",
        start: { dateTime: "2025-01-15T16:00:00-08:00" },
        end: { dateTime: "2025-01-15T17:30:00-08:00" },
        attendees: [{ email: "board@company.com", displayName: "Board of Directors" }],
        location: "Boardroom",
        status: "confirmed"
      }
    ]
  },
  {
    name: "Light Day",
    description: "Calm day with routine updates and light schedule",
    emails: [
      {
        id: "email_light_001",
        threadId: "thread_light_001",
        snippet: "Monthly team social event planning...",
        payload: {
          headers: [
            { name: "From", value: "HR Team <hr@company.com>" },
            { name: "Subject", value: "February Team Social Planning" },
            { name: "Date", value: "Wed, 15 Jan 2025 11:00:00 -0800" }
          ],
          body: {
            data: "Hi everyone!\n\nWe're planning our February team social event. Please share your preferences:\n\n• Bowling night\n• Escape room adventure\n• Cooking class\n• Mini golf tournament\n\nVoting deadline: January 25th\nEvent date: February 15th\n\nLooking forward to a fun team building experience!\n\nCheers,\nHR Team"
          }
        },
        internalDate: "1737829200000",
        labelIds: ["UNREAD", "INBOX"]
      },
      {
        id: "email_light_002",
        threadId: "thread_light_002",
        snippet: "Weekly design inspiration newsletter...",
        payload: {
          headers: [
            { name: "From", value: "Design Weekly <newsletter@designweekly.com>" },
            { name: "Subject", value: "Design Trends: Minimalism is Back" },
            { name: "Date", value: "Wed, 15 Jan 2025 07:30:00 -0800" }
          ],
          body: {
            data: "This Week in Design\n\n🎨 Trending: Clean, minimalist interfaces are making a comeback\n📱 Mobile-first design principles\n🌈 Color palettes inspired by nature\n✨ Micro-animations for better UX\n\nFeatured article: \"The Psychology of White Space\"\n\nHappy designing!\nThe Design Weekly Team"
          }
        },
        internalDate: "1737817800000",
        labelIds: ["UNREAD", "INBOX"]
      }
    ],
    calendar: [
      {
        id: "event_light_001",
        summary: "Coffee Chat with Emma",
        start: { dateTime: "2025-01-15T10:00:00-08:00" },
        end: { dateTime: "2025-01-15T10:30:00-08:00" },
        attendees: [{ email: "emma@company.com", displayName: "Emma Smith" }],
        location: "Office Café",
        status: "confirmed"
      },
      {
        id: "event_light_002",
        summary: "Optional: Design Review Session",
        start: { dateTime: "2025-01-15T15:00:00-08:00" },
        end: { dateTime: "2025-01-15T16:00:00-08:00" },
        attendees: [{ email: "design@company.com", displayName: "Design Team" }],
        location: "Design Studio",
        status: "tentative"
      }
    ]
  },
  {
    name: "Crisis Mode",
    description: "Multiple critical issues requiring immediate attention",
    emails: [
      {
        id: "email_crisis_001",
        threadId: "thread_crisis_001", 
        snippet: "Data breach detected - immediate action required...",
        payload: {
          headers: [
            { name: "From", value: "Security Team <security@company.com>" },
            { name: "Subject", value: "🚨 SECURITY BREACH DETECTED" },
            { name: "Date", value: "Wed, 15 Jan 2025 11:30:00 -0800" }
          ],
          body: {
            data: "IMMEDIATE ACTION REQUIRED\n\n🚨 SECURITY INCIDENT DETECTED\n\nBreach details:\n• Unauthorized access to customer database\n• Potential exposure: 10,000+ customer records\n• Attack vector: SQL injection on login portal\n• Discovery time: 11:15 AM\n\nCRITICAL ACTIONS:\n1. All systems locked down\n2. Legal team notified\n3. PR team on standby\n4. Customer notification prepared\n\nIncident response team assembled in 10 minutes.\n\nSECURITY TEAM"
          }
        },
        internalDate: "1737831000000",
        labelIds: ["UNREAD", "INBOX"]
      },
      {
        id: "email_crisis_002",
        threadId: "thread_crisis_002",
        snippet: "Major investor pulling out - emergency board meeting...",
        payload: {
          headers: [
            { name: "From", value: "CFO <cfo@company.com>" },
            { name: "Subject", value: "URGENT: Series B Funding Crisis" },
            { name: "Date", value: "Wed, 15 Jan 2025 11:15:00 -0800" }
          ],
          body: {
            data: "URGENT - CONFIDENTIAL\n\nOur lead Series B investor (Venture Capital Partners) is withdrawing their $50M commitment effective immediately.\n\nReason: Concerns over recent market conditions and our Q4 performance.\n\nIMMEDIATE IMPACT:\n• Funding gap: $50M\n• Runway reduced to 8 months\n• Other investors may follow\n\nEmergency board meeting called for 2 PM today.\nNeed contingency plans ASAP.\n\nCFO Office"
          }
        },
        internalDate: "1737830100000",
        labelIds: ["UNREAD", "INBOX"]
      },
      {
        id: "email_crisis_003",
        threadId: "thread_crisis_003",
        snippet: "Regulatory investigation launched by SEC...",
        payload: {
          headers: [
            { name: "From", value: "Legal Counsel <legal@company.com>" },
            { name: "Subject", value: "CONFIDENTIAL: SEC Investigation Notice" },
            { name: "Date", value: "Wed, 15 Jan 2025 10:45:00 -0800" }
          ],
          body: {
            data: "ATTORNEY-CLIENT PRIVILEGED\n\nWe have received formal notice of an SEC investigation into our financial reporting practices.\n\nScope:\n• Revenue recognition methods\n• Customer acquisition cost reporting\n• Q3 and Q4 2024 filings\n\nURGENT REQUIREMENTS:\n• Document preservation order in effect\n• All communications must be reviewed\n• External counsel being engaged\n• Media blackout on financial matters\n\nDo NOT discuss with anyone outside legal team.\n\nLegal Counsel"
          }
        },
        internalDate: "1737828300000",
        labelIds: ["UNREAD", "INBOX"]
      }
    ],
    calendar: [
      {
        id: "event_crisis_001",
        summary: "🚨 Security Incident Response",
        start: { dateTime: "2025-01-15T11:40:00-08:00" },
        end: { dateTime: "2025-01-15T13:00:00-08:00" },
        attendees: [{ email: "incident-response@company.com", displayName: "Incident Response Team" }],
        location: "Security Operations Center",
        status: "confirmed"
      },
      {
        id: "event_crisis_002",
        summary: "Emergency Board Meeting - Funding Crisis",
        start: { dateTime: "2025-01-15T14:00:00-08:00" },
        end: { dateTime: "2025-01-15T16:00:00-08:00" },
        attendees: [{ email: "board@company.com", displayName: "Board of Directors" }],
        location: "Executive Boardroom (CONFIDENTIAL)",
        status: "confirmed"
      },
      {
        id: "event_crisis_003",
        summary: "Legal Strategy Session - SEC Matter",
        start: { dateTime: "2025-01-15T16:30:00-08:00" },
        end: { dateTime: "2025-01-15T18:00:00-08:00" },
        attendees: [{ email: "legal@company.com", displayName: "Legal Team" }],
        location: "Attorney Conference Room",
        status: "confirmed"
      }
    ]
  }
];

export const getPresetByName = (name: string): DemoPreset | undefined => {
  return demoPresets.find(preset => preset.name === name);
};
