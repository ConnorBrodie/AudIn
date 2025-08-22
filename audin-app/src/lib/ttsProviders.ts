import OpenAI from 'openai';
import { prepareForTTS } from './ttsPreprocess';

// TTS Provider interface
export interface TTSProvider {
  name: string;
  generateAudio(script: string, voiceId?: string): Promise<ArrayBuffer>;
  getSupportedVoices?(): any[];
}

// OpenAI TTS Provider
export class OpenAITTSProvider implements TTSProvider {
  name = 'OpenAI';
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateAudio(script: string): Promise<ArrayBuffer> {
    // Use the TTS preprocessor for consistent formatting
    const cleanScript = prepareForTTS(script);

    console.log('🔊 OpenAI TTS: Generating audio...');

    const response = await this.openai.audio.speech.create({
      model: "tts-1-hd", // Using HD model for better quality
      voice: "nova", // More energetic voice for morning digest
      input: cleanScript,
      response_format: "mp3",
      speed: 1.0,
    });

    return await response.arrayBuffer();
  }
}

// ElevenLabs TTS Provider
export class ElevenLabsTTSProvider implements TTSProvider {
  name = 'ElevenLabs';
  private apiKey: string;
  private defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Bella - warm, friendly)

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getSupportedVoices() {
    const { ELEVENLABS_VOICES } = require('./elevenLabsVoices');
    return ELEVENLABS_VOICES;
  }

  async generateAudio(script: string, voiceId?: string): Promise<ArrayBuffer> {
    // Use the advanced TTS preprocessor for optimal prosody
    const cleanScript = prepareForTTS(script);

    const selectedVoiceId = voiceId || this.defaultVoiceId;
    console.log(`🎙️ ElevenLabs: Generating premium audio with voice ${selectedVoiceId}...`);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text: cleanScript,
        model_id: 'eleven_multilingual_v2', // Using the latest model
        voice_settings: {
          stability: 0.25,           // Lower = more expressive and natural
          similarity_boost: 0.7,    // Closer to reference voice
          style: 0.3,               // A bit more "performed" for podcast feel
          use_speaker_boost: false   // Enhances voice clarity
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }
}

// Factory function to get the best available TTS provider
export function getTTSProvider(): TTSProvider {
  const elevenLabsKey = process.env.ELEVEN_LABS_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Prefer ElevenLabs if API key is available
  if (elevenLabsKey && elevenLabsKey.trim() !== '') {
    console.log('🎙️ Using ElevenLabs TTS (Premium Quality)');
    return new ElevenLabsTTSProvider(elevenLabsKey);
  }

  // Fallback to OpenAI
  if (openaiKey && openaiKey.trim() !== '') {
    console.log('🔊 Using OpenAI TTS (HD Quality)');
    return new OpenAITTSProvider(openaiKey);
  }

  throw new Error('No TTS provider available. Please set ELEVEN_LABS_KEY or OPENAI_API_KEY in your environment variables.');
}

// Helper function to test TTS provider availability
export function getAvailableTTSProviders(): string[] {
  const providers: string[] = [];
  
  if (process.env.ELEVEN_LABS_KEY?.trim()) {
    providers.push('ElevenLabs (Premium)');
  }
  
  if (process.env.OPENAI_API_KEY?.trim()) {
    providers.push('OpenAI TTS-HD');
  }
  
  return providers;
}
