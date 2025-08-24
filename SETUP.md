# 🛠️ AudIn Complete Setup Guide

This guide will walk you through setting up AudIn from scratch, including all the necessary API keys, OAuth configuration, and troubleshooting common issues.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** ([download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download here](https://git-scm.com/))
- **Google account** (for Gmail/Calendar OAuth)
- **OpenAI account** (for AI processing)
- **ElevenLabs account** (optional, for premium voices)

## 🚀 Step 1: Project Setup

### 1.1 Clone the Repository (not relevant for Hackathon submission, files provided.)
```bash
git clone https://github.com/your-username/audin
cd audin/audin-app
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Verify Installation
```bash
npm run dev
```
You should see the Next.js development server start on `http://localhost:3000`.

## 🔐 Step 2: Environment Configuration

### 2.1 Create Environment File
In the `audin-app` directory, create a `.env` file:

### 2.2 Required Environment Variables

Your `.env` file should contain (enter the relevant keys):

```env
# Necessary API Key
OPENAI_API_KEY=

# Development settings, leave this
NODE_ENV=development

# Only needed for premium TTS AI, otherwise will use the GPT TTS API.
ELEVEN_LABS_KEY=

# Only needed for setting up oauth, not needed for demo.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

**⚠️ Important**: Never commit `.env` to version control! It's already in `.gitignore`.

**✅ Demo Mode**: If you only want to try the demo mode, you can skip the OAuth setup entirely. Just provide `OPENAI_API_KEY` and the app will work in demo-only mode.

**⚠️ OAuth Setup**: This section is ONLY needed for user authentication with real Gmail/Calendar data.

## 🌩️ Step 3: Google Cloud Console Setup

### 3.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** or select an existing one
3. Give your project a name (e.g., "AudIn Development")
4. Note your **Project ID** for reference

### 3.2 Enable Required APIs

1. In the Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for and enable these APIs:
   - **Gmail API**
   - **Google Calendar API**

### 3.3 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. If prompted, configure the **OAuth consent screen**:
   - Choose **"External"** for user type
   - Fill in required fields:
     - App name: "AudIn"
     - User support email: your email
     - Developer contact email: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/calendar.readonly`

4. Create the OAuth client:
   - Application type: **"Web application"**
   - Name: "AudIn Development"
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google`

5. Copy the **Client ID** and **Client Secret** to your `.env` file

### 3.4 Add Test Users (While in Testing Mode)

1. In OAuth consent screen settings, go to **"Test users"**
2. Click **"Add users"**
3. Add your email address and any other emails you want to test with
4. **Important**: Only these emails can use the app while it's in testing mode

## 🤖 Step 4: OpenAI API Setup

### 4.1 Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to **"API Keys"** in the dashboard

### 4.2 Generate API Key
1. Click **"Create new secret key"**
2. Give it a name (e.g., "AudIn Development")
3. Copy the key and add it to your `.env` file as `OPENAI_API_KEY`

### 4.3 Add Billing (Required)
- OpenAI requires a payment method for API usage
- Go to **"Billing"** and add a payment method
- Consider setting **usage limits** to avoid unexpected charges

## 🎵 Step 5: ElevenLabs Setup (Optional)

ElevenLabs provides premium, natural-sounding voices. If you skip this, AudIn will use your browser's built-in text-to-speech.

### 5.1 Create ElevenLabs Account
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for an account

### 5.2 Get API Key
1. Go to **"Settings" > "API Keys"**
2. Generate a new API key
3. Add it to your `.env` file as `ELEVENLABS_API_KEY`

### 5.3 Voice Credits
- ElevenLabs provides free monthly credits
- Monitor your usage in the dashboard
- Upgrade your plan if needed for higher usage

## 🎯 Step 6: Generate NextAuth Secret

Generate a secure secret for NextAuth.js:

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

Add this to your `.env` file as `NEXTAUTH_SECRET`.

## ✅ Step 7: Test Your Setup

### 7.1 Start the Development Server
```bash
npm run dev
```

### 7.2 Test OAuth Flow
1. Go to `http://localhost:3000`
2. Click **"Connect with Google"**
3. Complete the OAuth flow
4. You should be redirected to the dashboard

### 7.3 Test Demo Mode (Alternative)
If OAuth isn't working yet:
1. Click **"Try Demo Mode"** instead
2. Test the audio generation and playback features
3. This helps isolate OAuth issues from other problems

## 🆘 Getting Help

If you're having issues:

1. **Try demo mode first** - Isolate whether the issue is with OAuth or core functionality
2. **Check the logs** - Look in browser console and terminal output
3. **Verify API keys** - Make sure they're correct and have sufficient credits

## 🎉 You're Ready!

Once everything is set up, you should be able to:

- ✅ Authenticate with Google OAuth
- ✅ Fetch emails from your Gmail
- ✅ Access your Google Calendar
- ✅ Generate AI-powered email summaries
- ✅ Create audio digests with multiple voice options
- ✅ Use interactive audio controls

**Enjoy your personalized inbox radio!** 🎧

---

*For more information, see the main [README.md](./README.md)*
