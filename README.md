# 🎧 AudIn - Your Personal Inbox Radio

**Transform your emails and calendar into a personalized podcast-style audio digest in under 2 minutes.**

AudIn is an AI-powered "inbox radio" that converts your unread emails and calendar events into a conversational, hands-free audio briefing. Perfect for busy professionals who want to stay informed during commutes, workouts, or while multitasking. Made in 48 hours for Employment Hero's AI Hackathon: Revolutionise Work with AI.

## 🎯 The Problem We're Solving

**Email overload is draining productivity.** The average professional:  
- **Receives 120+ emails every day** and spends **over 2.5 hours** managing them (McKinsey, Forbes)  
- **Takes ~23 minutes to refocus** after each interruption (UC Irvine study)  
- Constant notifications and context switching make it easy for **important messages to get lost in the noise** 

**Traditional solutions don't work:**
- Filters still require you to stop and read 
- Mobile notifications create more interruptions
- "Inbox Zero" strategies are time-intensive and unsustainable
- Voice assistants can't understand email context or prioritization

**The result?** Professionals start their day reactive instead of proactive, drowning in digital noise instead of focusing on what matters.

## 💡 Our Solution: Audio-First Email Intelligence

AudIn transforms the email experience from **visual overwhelm** to **audio clarity**:

**🎧 Hands-Free Consumption**
- Listen during commutes, workouts, or morning routines
- No screen time required - perfect for multitasking
- Natural conversation flow that's easy to follow

**🧠 AI-Powered Prioritization**
- Smart importance scoring (1-10) based on content analysis
- Urgent items surfaced first, noise filtered out
- Context-aware summaries that capture key actions needed

**⚡ Radical Time Efficiency**
- 2-minute digest covers your entire inbox
- Calendar integration provides complete daily context

## 🏆 Competitive Advantage

**Our Innovation:**
- **First audio-native email solution** designed for busy professionals
- **Conversational AI** that understands email context and urgency
- **Privacy-by-design** - no data storage, local API key management
- **Seamless calendar integration** for complete daily context

## ✨ Features

### 🎙️ **Intelligent Audio Digest**
- **2-minute briefings** that cover all your important emails and calendar events
- **Natural conversation flow** with pauses, emphasis, and professional tone
- **Smart prioritization** - urgent items first, organized by importance
- **Calendar integration** - know what's coming up in your day

### 🎵 **Premium Audio Experience**
- **Multiple playback speeds** (0.5x, 1x, 1.5x, 2x)
- **Interactive audio scrubber** - click or drag to any position
- **High-quality TTS** with ElevenLabs premium voices
- **Fallback to browser TTS** when needed

### 🔒 **Privacy-First Design**
- **No data storage** - everything processes in your browser
- **OAuth authentication** - secure Gmail and Calendar access
- **Your API keys** - stored locally, never sent to our servers
- **Open source** - full transparency

### 🌅 **Smart Digest Modes**
- **Morning Brief** - Today's emails + today's calendar
- **Evening Recap** - Today's emails + tomorrow's schedule (plus weekends on Friday!)
- **Auto Mode** - Intelligently switches based on time of day

### 🎭 **Demo Mode**
- **Try without OAuth** - test with sample data
- **Editable scenarios** - customize demo emails and events
- **Perfect for presentations** - no need to connect real accounts, just provide an openAI API key

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **OpenAI API key** ([get one here](https://platform.openai.com/api-keys))
- **Google Cloud Console project** with Gmail and Calendar APIs enabled
- **ElevenLabs API key** (optional, for premium voices)



### 1. Clone and Install
```bash
git clone https://github.com/your-username/audin
cd audin/audin-app
npm install
```

### 2. Environment Setup

See SETUP.md

### 3. Run the App
```bash
npm run dev
```

Visit `http://localhost:3000` and start listening to your inbox! 🎧

## 📖 Detailed Setup Guide

For step-by-step setup instructions, troubleshooting, and deployment guides, see our **[Complete Setup Guide](./SETUP.md)**.

## 📊 Impact & Value Metrics

**Time Savings:**
- **30+ minutes saved daily** - from 2.5 hours of email management to 2-minute digest
- **Zero context switching** - consume information without breaking focus
- **Instant prioritization** - know what's urgent before opening your inbox

**Productivity Gains:**
- **Start days proactively** - understand priorities before reactive email checking
- **Better decision making** - AI summaries highlight key actions and deadlines
- **Reduced email anxiety** - comprehensive overview eliminates FOMO

**Accessibility Benefits:**
- **Multitasking enabled** - stay informed while commuting, exercising, or cooking
- **Screen-time reduction** - audio consumption reduces digital eye strain
- **Universal access** - works for users with visual impairments or reading difficulties

**Business Impact:**
- **Faster response times** - urgent items identified immediately
- **Reduced missed opportunities** - important emails never buried in noise
- **Improved work-life balance** - efficient morning routine, less evening catch-up

## 🎬 Demo Walkthrough

**5-Minute User Journey:**

**1. Quick Setup (30 seconds)**
```
→ Add OpenAI API key to .env
→ npm run dev
→ Choose "Try Demo Mode" or "Connect Gmail"
```

**2. Generate Your Digest (60 seconds)**
```
→ Select voice (ElevenLabs premium or OpenAI)
→ Choose digest mode (Morning Brief/Evening Recap/Auto)
→ Click "Generate Today's Digest"
→ AI processes emails + calendar in real-time
```

**3. Listen & Navigate (2 minutes)**
```
→ Play 2-minute audio digest
→ Interactive scrubber - jump to any section
→ Playback speed control (0.5x to 2x)
→ View text summary if needed
```

**4. Real-World Usage (ongoing)**
```
→ Morning: 2-minute briefing during coffee
→ Commute: Hands-free updates while driving
→ Evening: Tomorrow's prep while cooking dinner
```

**Demo Scenarios Available:**
- **Light Day**: 3 emails, 2 calendar events
- **Busy Day**: 8 emails, 5 calendar events  
- **Crisis Mode**: 12 urgent emails, packed calendar
- **Custom**: Edit your own demo data

## 🎯 Use Cases

- **🌅 Morning Briefing** - Get your day started with a quick audio overview
- **🚗 Commute Companion** - Stay informed hands-free while traveling  
- **🏃‍♀️ Workout Updates** - Listen while exercising or multitasking
- **⚡ Rapid Triage** - Quickly identify urgent items without opening your inbox
- **📊 Daily Planning** - Understand your schedule and priorities in context

## 🔧 Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js with Google OAuth
- **APIs**: Gmail API, Calendar API, OpenAI GPT, ElevenLabs TTS
- **Audio**: HTML5 Audio with custom controls
- **Deployment**: Vercel-ready

## 🎨 Digest Modes Explained

### 🌅 Morning Brief
- **Emails**: Last 3 days, Primary inbox only
- **Calendar**: Today's events
- **Tone**: Energetic, "let's get ready for the day"
- **Best for**: 6 AM - 12 PM

### 🌙 Evening Recap  
- **Emails**: Last 3 days, Primary inbox only
- **Calendar**: Tomorrow's schedule (+ weekend prep on Fridays)
- **Tone**: Reflective, "prepare for what's ahead" 
- **Best for**: 6 PM - 11 PM

### 🤖 Auto Mode
Automatically switches between Morning Brief and Evening Recap based on current time.

## 🔐 Privacy & Security

AudIn is designed with privacy as a core principle:

- ✅ **No server storage** - emails and summaries never leave your browser
- ✅ **OAuth standard** - secure, industry-standard authentication  
- ✅ **Local API keys** - stored in your browser only
- ✅ **Open source** - audit the code yourself
- ✅ **Minimal permissions** - read-only access to Gmail and Calendar

## 🚀 Future Vision & Scalability

**Immediate Roadmap (Next 3 months):**
- **Multi-language support** - expand beyond English
- **Team digests** - shared briefings for organizations
- **Smart scheduling** - automatic digest timing based on calendar
- **Integration expansion** - Slack, Microsoft Teams, Notion

**Long-term Vision (6-12 months):**
- **Enterprise deployment** - on-premises solutions for large organizations
- **AI personalization** - learning user preferences and communication styles
- **Voice interaction** - "Hey AudIn, what's urgent today?"
- **Analytics dashboard** - productivity insights and email pattern analysis

**Market Opportunity:**
- **1.4 billion** knowledge workers globally struggling with email overload
- **$28 billion** annual productivity loss from email inefficiency
- **Growing remote work** trend increases need for asynchronous communication tools
- **Audio-first** consumption aligns with podcast/audiobook market growth (30%+ YoY)

**Technical Innovation:**
- **Novel AI pipeline** - two-stage GPT processing for context + conversation
- **Privacy-first architecture** - local processing, no data retention
- **Audio-native UX** - designed for ears, not eyes
- **Seamless integration** - works with existing email workflows

## 🏆 Hackathon Achievement

**What We Built:**
- ✅ **Full-stack application** with Next.js 15 + React 19
- ✅ **AI-powered email processing** with OpenAI GPT-3.5-turbo
- ✅ **Premium TTS integration** with ElevenLabs + OpenAI fallback
- ✅ **OAuth authentication** with Gmail and Calendar APIs
- ✅ **Interactive audio player** with scrubbing and speed controls
- ✅ **Demo mode** with editable scenarios for presentations
- ✅ **Privacy-focused design** with local API key management
- ✅ **Responsive UI** with dark mode and modern design

**Technical Challenges Solved:**
- Complex email parsing and content extraction
- Two-stage AI pipeline for summarization + script generation
- Real-time audio generation and playback
- Graceful error handling for missing environment variables
- Secure OAuth implementation with session management

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**🎧 AudIn - Transforming Email Overload into Audio Clarity**

*Built for the Employment Hero AI Hackathon 2025*  
