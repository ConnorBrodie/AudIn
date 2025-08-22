import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getAvailableTTSProviders } = await import('@/lib/ttsProviders');
    const providers = getAvailableTTSProviders();
    
    const activeProvider = process.env.ELEVEN_LABS_KEY?.trim() 
      ? 'ElevenLabs (Premium)' 
      : process.env.OPENAI_API_KEY?.trim() 
        ? 'OpenAI TTS-HD' 
        : 'None';

    return NextResponse.json({
      success: true,
      data: {
        activeProvider,
        availableProviders: providers,
        hasElevenLabs: !!process.env.ELEVEN_LABS_KEY?.trim(),
        hasOpenAI: !!process.env.OPENAI_API_KEY?.trim()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get TTS status',
        data: { activeProvider: 'Unknown', availableProviders: [] }
      },
      { status: 500 }
    );
  }
}
