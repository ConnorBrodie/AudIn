"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { ELEVENLABS_VOICES, type ElevenLabsVoice } from "@/lib/elevenLabsVoices";

interface VoiceSelectorProps {
  isElevenLabsActive: boolean;
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
}

export default function VoiceSelector({ 
  isElevenLabsActive, 
  selectedVoiceId, 
  onVoiceChange 
}: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoice | null>(null);

  useEffect(() => {
    const voice = ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId);
    setSelectedVoice(voice || ELEVENLABS_VOICES[1]); // Default to Bella
  }, [selectedVoiceId]);

  if (!isElevenLabsActive) return null;

  const handleVoiceSelect = (voice: ElevenLabsVoice) => {
    setSelectedVoice(voice);
    onVoiceChange(voice.id);
  };

  const maleVoices = ELEVENLABS_VOICES.filter(v => v.gender === 'male');
  const femaleVoices = ELEVENLABS_VOICES.filter(v => v.gender === 'female');

  return (
    <Card className="max-w-4xl mx-auto mb-6 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          🎙️ ElevenLabs Voice Selection
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose from premium human-like voices • Currently selected: <span className="font-medium">{selectedVoice?.name}</span>
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Female Voices */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Female Voices
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {femaleVoices.map((voice) => (
                <Button
                  key={voice.id}
                  variant={selectedVoice?.id === voice.id ? "default" : "outline"}
                  onClick={() => handleVoiceSelect(voice)}
                  className="relative"
                  size="sm"
                >
                  {voice.name}
                  {selectedVoice?.id === voice.id && (
                    <div className="absolute top-1 right-1 h-2 w-2 bg-primary-foreground rounded-full"></div>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Male Voices */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Male Voices
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {maleVoices.map((voice) => (
                <Button
                  key={voice.id}
                  variant={selectedVoice?.id === voice.id ? "default" : "outline"}
                  onClick={() => handleVoiceSelect(voice)}
                  className="relative"
                  size="sm"
                >
                  {voice.name}
                  {selectedVoice?.id === voice.id && (
                    <div className="absolute top-1 right-1 h-2 w-2 bg-primary-foreground rounded-full"></div>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
