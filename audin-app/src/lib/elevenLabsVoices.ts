// ElevenLabs Voice Configurations - Most Human-Sounding Voices

export interface ElevenLabsVoice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent: string;
  age: string;
  useCase: string;
}

// Premium human-like voices from ElevenLabs
export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Deep, authoritative, and very natural - perfect for news and professional content',
    gender: 'male',
    accent: 'American',
    age: 'Middle-aged',
    useCase: 'News, Business, Professional'
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Warm, friendly, and conversational - ideal for personal assistant roles',
    gender: 'female', 
    accent: 'American',
    age: 'Young Adult',
    useCase: 'Assistant, Conversational, Friendly'
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description: 'Crisp, clear, and professional - excellent for business communications',
    gender: 'male',
    accent: 'American', 
    age: 'Adult',
    useCase: 'Business, Professional, Clear'
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Natural, casual, and engaging - perfect for daily updates and friendly content',
    gender: 'male',
    accent: 'American',
    age: 'Young Adult', 
    useCase: 'Casual, Daily Updates, Engaging'
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    description: 'Smooth, professional, and articulate - great for informative content',
    gender: 'female',
    accent: 'American',
    age: 'Adult',
    useCase: 'Professional, Informative, Articulate'
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    description: 'Confident, clear, and authoritative - excellent for news and announcements',
    gender: 'female',
    accent: 'American',
    age: 'Adult', 
    useCase: 'News, Announcements, Confident'
  }
];

// Get voice by ID
export function getVoiceById(voiceId: string): ElevenLabsVoice | undefined {
  return ELEVENLABS_VOICES.find(voice => voice.id === voiceId);
}

// Get recommended voice for inbox digest (default)
export function getDefaultVoice(): ElevenLabsVoice {
  // Bella - warm, friendly, perfect for personal assistant role
  return ELEVENLABS_VOICES.find(voice => voice.id === 'EXAVITQu4vr4xnSDxMaL') || ELEVENLABS_VOICES[0];
}

// Get voices by gender
export function getVoicesByGender(gender: 'male' | 'female'): ElevenLabsVoice[] {
  return ELEVENLABS_VOICES.filter(voice => voice.gender === gender);
}
