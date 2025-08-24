import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if OAuth is properly configured
    const hasOAuthConfig = !!(
      process.env.NEXTAUTH_SECRET && 
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET
    );

    const hasOpenAI = !!process.env.OPENAI_API_KEY?.trim();
    const hasElevenLabs = !!process.env.ELEVEN_LABS_KEY?.trim();

    return NextResponse.json({
      success: true,
      data: {
        oauthEnabled: hasOAuthConfig,
        openaiEnabled: hasOpenAI,
        elevenLabsEnabled: hasElevenLabs,
        demoModeAvailable: hasOpenAI, // Demo mode requires at least OpenAI
        recommendedMode: hasOAuthConfig ? 'oauth' : 'demo'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get OAuth status',
        data: { 
          oauthEnabled: false, 
          openaiEnabled: false,
          elevenLabsEnabled: false,
          demoModeAvailable: false,
          recommendedMode: 'demo'
        }
      },
      { status: 500 }
    );
  }
}
