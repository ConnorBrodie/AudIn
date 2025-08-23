# 🎧 AudIn - Your Personal Inbox Radio

**Transform your emails and calendar into a personalized podcast-style audio digest in under 2 minutes.**

AudIn is an AI-powered "inbox radio" that converts your unread emails and calendar events into a conversational, hands-free audio briefing. Perfect for busy professionals who want to stay informed during commutes, workouts, or while multitasking.

![AudIn Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=AudIn+Demo+Screenshot)

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/your-username/audin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/audin/discussions)
- **Email**: hello@audin.app

---

**Made with ❤️ for busy people who want to stay informed without staying glued to their inbox.**

*AudIn - Because your inbox deserves a better soundtrack.* 🎵
