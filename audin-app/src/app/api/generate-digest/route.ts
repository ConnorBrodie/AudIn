import { NextRequest, NextResponse } from 'next/server';
import { generateDemoDigest } from '@/lib/aiPipeline';

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
    } else {
      return NextResponse.json(
        { success: false, error: 'OAuth mode not implemented yet. Please use demo mode.' },
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
