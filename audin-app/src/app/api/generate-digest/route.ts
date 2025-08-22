import { NextRequest, NextResponse } from 'next/server';
import { generateDemoDigest } from '@/lib/aiPipeline';
import { generateOAuthDigest } from '@/lib/digestGenerator';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, customData, voiceId } = body;

    if (mode === 'demo') {
      console.log('🎭 Generating demo digest...');
      
      // Use custom data if provided, otherwise use default mock data
      let result;
      if (customData && customData.emails && customData.calendar) {
        console.log('📝 Using custom demo data...');
        const { generateDigest } = await import('@/lib/aiPipeline');
        result = await generateDigest(customData.emails, customData.calendar, voiceId);
      } else {
        console.log('📋 Using default demo data...');
        result = await generateDemoDigest(voiceId);
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
      
      // Get user session to access the access token
      const session = await getServerSession(authOptions);
      
      if (!session?.accessToken) {
        return NextResponse.json(
          { success: false, error: 'No valid session found. Please sign in with Google.' },
          { status: 401 }
        );
      }
      
      const result = await generateOAuthDigest(session.accessToken, voiceId);
      
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
