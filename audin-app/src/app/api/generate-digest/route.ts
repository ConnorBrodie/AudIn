import { NextRequest, NextResponse } from 'next/server';
import { generateDemoDigest } from '@/lib/aiPipeline';
import { generateOAuthDigest } from '@/lib/digestGenerator';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Security: Check request size to prevent DoS attacks
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
      return NextResponse.json(
        { success: false, error: 'Request too large. Maximum size is 1MB.' },
        { status: 413 }
      );
    }

    // Security: Add timeout for JSON parsing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    let body;
    try {
      body = await request.json();
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const { mode, customData, voiceId, digestMode } = body;

    // Security: Basic input validation
    if (!mode || typeof mode !== 'string' || !['demo', 'oauth'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mode. Must be "demo" or "oauth".' },
        { status: 400 }
      );
    }

    if (digestMode && (typeof digestMode !== 'string' || !['auto', 'morning', 'evening'].includes(digestMode))) {
      return NextResponse.json(
        { success: false, error: 'Invalid digestMode. Must be "auto", "morning", or "evening".' },
        { status: 400 }
      );
    }

    if (voiceId && (typeof voiceId !== 'string' || voiceId.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'Invalid voiceId. Must be a string under 100 characters.' },
        { status: 400 }
      );
    }

    // Validate customData structure if provided
    if (customData && mode === 'demo') {
      if (typeof customData !== 'object' || !customData.emails || !customData.calendar) {
        return NextResponse.json(
          { success: false, error: 'Invalid customData structure. Must contain emails and calendar arrays.' },
          { status: 400 }
        );
      }
      
      if (!Array.isArray(customData.emails) || !Array.isArray(customData.calendar)) {
        return NextResponse.json(
          { success: false, error: 'Invalid customData. emails and calendar must be arrays.' },
          { status: 400 }
        );
      }

      // Limit array sizes to prevent abuse
      if (customData.emails.length > 20 || customData.calendar.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Too many items. Maximum 20 emails and 20 calendar events allowed.' },
          { status: 400 }
        );
      }
    }

    if (mode === 'demo') {
      console.log('🎭 Generating demo digest...');
      
      // Use custom data if provided, otherwise use default mock data
      let result;
      if (customData && customData.emails && customData.calendar) {
        console.log('📝 Using custom demo data...');
        const { generateDigest } = await import('@/lib/aiPipeline');
        result = await generateDigest(customData.emails, customData.calendar, voiceId, digestMode);
      } else {
        console.log('📋 Using default demo data...');
        result = await generateDemoDigest(voiceId, digestMode);
      }
      
      // Convert audio buffer to base64 for JSON response
      const audioBase64 = Buffer.from(result.audioBuffer).toString('base64');
      
      return NextResponse.json({
        success: true,
        data: {
          emailSummary: result.emailSummary,
          podcastScript: result.podcastScript,
          textDigest: result.textDigest,
          audioBase64: audioBase64,
          processedEmails: result.processedEmails,
          processedEvents: result.processedEvents,
          structuredData: result.structuredData
        }
      });
    } else if (mode === 'oauth') {
      console.log('🔐 Generating OAuth digest...');
      
      // Get user session and JWT token to access the access token
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'No valid session found. Please sign in with Google.' },
          { status: 401 }
        );
      }

      // Get access token from JWT (server-side only)
      const { getToken } = await import('next-auth/jwt');
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      
      if (!token?.accessToken) {
        return NextResponse.json(
          { success: false, error: 'No valid access token found. Please sign in again.' },
          { status: 401 }
        );
      }
      
      const result = await generateOAuthDigest(token.accessToken as string, voiceId, digestMode);
      
      // Convert audio buffer to base64 for JSON response
      const audioBase64 = Buffer.from(result.audioBuffer).toString('base64');
      
      return NextResponse.json({
        success: true,
        data: {
          emailSummary: `Processed ${result.digest.total_emails} unread emails and ${result.digest.total_events} calendar events`,
          podcastScript: result.script,
          textDigest: result.script, // Using script as text digest for now
          audioBase64: audioBase64,
          processedEmails: result.digest.emails,
          processedEvents: result.digest.calendar,
          structuredData: result.digest
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid mode. Please specify "demo" or "oauth".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AudIn Digest API is running',
    endpoints: {
      POST: 'Generate digest with { mode: "demo" | "oauth" }'
    }
  });
}
