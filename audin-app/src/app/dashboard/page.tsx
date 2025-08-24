"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, Settings, Play, Pause, Download, Copy, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import DemoDataEditor from "@/components/DemoDataEditor";
import { Email } from "@/types/email";
import { CalendarEvent } from "@/types/calendar";
import { demoPresets, getPresetByName } from "@/data/demoPresets";
import { getDefaultVoice, ELEVENLABS_VOICES } from "@/lib/elevenLabsVoices";

interface DigestData {
  emailSummary: string;
  podcastScript: string;
  textDigest: string;
  audioBase64: string;
  processedEmails: number | any[]; // Can be number (demo) or array (oauth)
  processedEvents: number | any[]; // Can be number (demo) or array (oauth)
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isDemo, setIsDemo] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [digestData, setDigestData] = useState<DigestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [customDemoData, setCustomDemoData] = useState<{emails: Email[], calendar: CalendarEvent[]} | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("Default");
  const [ttsProvider, setTtsProvider] = useState<string>("Loading...");
  const [isElevenLabsActive, setIsElevenLabsActive] = useState<boolean>(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(getDefaultVoice().id);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [digestMode, setDigestMode] = useState<'auto' | 'morning' | 'evening'>('auto');
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const router = useRouter();

  // Helper function to get actual digest mode
  const getActualDigestMode = (): 'morning' | 'evening' => {
    if (digestMode !== 'auto') return digestMode;
    
    const hour = new Date().getHours();
    return hour >= 17 ? 'evening' : 'morning'; // 5 PM cutoff
  };

  // Helper function to get mode display text
  const getModeDisplayText = (): string => {
    const actualMode = getActualDigestMode();
    
    if (digestMode === 'auto') {
      const dayOfWeek = new Date().getDay();
      const isFriday = dayOfWeek === 5;
      const isEvening = actualMode === 'evening';
      
      // Only show time on client side to avoid hydration mismatch
      const timeDisplay = isClient ? (() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const formattedHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const period = hours >= 12 ? 'PM' : 'AM';
        return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period} - `;
      })() : '';
      
      if (isFriday && isEvening) {
        return `Auto (${timeDisplay}Weekend & Monday Prep)`;
      }
      return `Auto (${timeDisplay}${actualMode.charAt(0).toUpperCase() + actualMode.slice(1)} mode)`;
    }
    
    return digestMode.charAt(0).toUpperCase() + digestMode.slice(1) + ' Brief';
  };

  // Helper function to format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle seeking in the audio
  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef || !duration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle progress bar drag start
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(event);
  };

  // Handle progress bar drag
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleSeek(event);
  };

  // Handle progress bar drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const progressBar = document.querySelector('[data-audio-progress]') as HTMLElement;
        if (progressBar && audioRef && duration) {
          const rect = progressBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newTime = Math.max(0, Math.min((clickX / rect.width) * duration, duration));
          audioRef.currentTime = newTime;
          setCurrentTime(newTime);
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, audioRef, duration]);

  useEffect(() => {
    // Set client flag after hydration to avoid mismatch
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check authentication status and mode
    if (status === "loading") return; // Wait for session to load
    
    const demoMode = sessionStorage.getItem("audin-demo-mode");
    
    if (demoMode === "true") {
      setIsDemo(true);
    } else if (session) {
      // User is authenticated with OAuth
      setIsDemo(false);
    } else {
      // No session and not in demo mode - redirect to home
      router.push("/");
    }
  }, [session, status, router]);

  // Apply playback speed when audio element is ready
  useEffect(() => {
    if (audioRef) {
      audioRef.playbackRate = playbackSpeed;
    }
  }, [audioRef, playbackSpeed]);

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: isDemo ? 'demo' : 'oauth',
          customData: customDemoData,
          voiceId: isElevenLabsActive ? selectedVoiceId : undefined,
          digestMode: getActualDigestMode()
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate digest');
      }

      // Convert base64 audio to blob URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(result.data.audioBase64), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      setDigestData(result.data);
      setAudioUrl(audioUrl);
      setAudioReady(true);

    } catch (err) {
      console.error('Error generating digest:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef || !audioUrl) return;

    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef) {
      audioRef.playbackRate = speed;
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `audin-digest-${new Date().toISOString().split('T')[0]}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyText = () => {
    if (!digestData) return;
    
    navigator.clipboard.writeText(digestData.textDigest);
    // You could add a toast notification here
  };

  const handleDemoDataChange = (emails: Email[], calendar: CalendarEvent[]) => {
    setCustomDemoData({ emails, calendar });
    // Store in session storage for persistence during session
    sessionStorage.setItem('audin-custom-demo-data', JSON.stringify({ emails, calendar }));
    // Mark as custom when data is manually edited
    setSelectedPreset("Custom");
  };

  const handlePresetSelection = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setCustomDemoData({ emails: preset.emails, calendar: preset.calendar });
      setSelectedPreset(presetName);
      // Store in session storage
      sessionStorage.setItem('audin-custom-demo-data', JSON.stringify({ emails: preset.emails, calendar: preset.calendar }));
      sessionStorage.setItem('audin-selected-preset', presetName);
    }
  };

  // Load custom demo data and selected preset on mount
  useEffect(() => {
    if (isDemo) {
      // Load saved preset selection
      const savedPreset = sessionStorage.getItem('audin-selected-preset');
      if (savedPreset) {
        setSelectedPreset(savedPreset);
      }

      // Load saved custom data
      const savedData = sessionStorage.getItem('audin-custom-demo-data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setCustomDemoData(parsed);
        } catch (error) {
          console.error('Failed to parse saved demo data:', error);
          // Fallback to default preset
          handlePresetSelection("Default");
        }
      } else {
        // Initialize with default preset if no saved data
        handlePresetSelection("Default");
      }
    }
  }, [isDemo]);

  // Load TTS provider status
  useEffect(() => {
    const fetchTTSStatus = async () => {
      try {
        const response = await fetch('/api/tts-status');
        const result = await response.json();
        if (result.success) {
          setTtsProvider(result.data.activeProvider);
          setIsElevenLabsActive(result.data.hasElevenLabs);
        }
      } catch (error) {
        console.error('Failed to fetch TTS status:', error);
        setTtsProvider("Unknown");
      }
    };

    fetchTTSStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
                      <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Radio className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  AudIn
                </h1>
                {isDemo && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    Demo Mode
                  </span>
                )}
                {session && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                    📧 {session.user?.email}
                  </span>
                )}
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                  🎙️ {ttsProvider}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {session && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Sign Out
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Ready for your daily digest?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {isDemo 
                ? "Experience AudIn with sample emails and calendar events"
                : `We'll process your unread emails and today's calendar events from ${session?.user?.email}`
              }
            </p>
          </div>







          {/* Main Configuration Box - Hidden when digest is generated */}
          {!digestData && (
          <Card className="max-w-3xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🎙️ Create Your Daily Digest
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Configure your personalized audio briefing
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Digest Mode Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    📅 Digest Mode
                  </label>
                  <Select value={digestMode} onValueChange={(value: 'auto' | 'morning' | 'evening') => setDigestMode(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <span>🤖 Auto</span>
                          <span className="text-xs text-slate-500">- Detects time of day</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="morning">
                        <div className="flex items-center gap-2">
                          <span>🌅 Morning Brief</span>
                          <span className="text-xs text-slate-500">- Today's urgent items</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="evening">
                        <div className="flex items-center gap-2">
                          <span>🌙 Evening Recap</span>
                          <span className="text-xs text-slate-500">- Pending & tomorrow prep</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Current mode indicator */}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Current: <span className="font-medium text-primary">{getModeDisplayText()}</span>
                  </div>
                </div>

                {/* Voice Selector */}
                {isElevenLabsActive && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      🎤 Voice Selection
                    </label>
                    <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Female Voices
                        </div>
                        {ELEVENLABS_VOICES.filter(v => v.gender === 'female').map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div className="flex items-center gap-2">
                              <span>{voice.name}</span>
                              {voice.name === 'Bella' && <span className="text-xs text-primary font-medium">(Default)</span>}
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide mt-2">
                          Male Voices
                        </div>
                        {ELEVENLABS_VOICES.filter(v => v.gender === 'male').map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <span>{voice.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Using ElevenLabs premium voices
                    </div>
                  </div>
                )}

                {/* TTS Provider indicator if not ElevenLabs */}
                {!isElevenLabsActive && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      🎤 Voice Provider
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {ttsProvider}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Add ELEVEN_LABS_KEY to .env for premium voices
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Scenarios (if in demo mode) */}
              {isDemo && (
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    📋 Demo Scenario
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {demoPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant={selectedPreset === preset.name ? "default" : "outline"}
                        onClick={() => handlePresetSelection(preset.name)}
                        size="sm"
                        className="h-auto p-3 text-left justify-start relative"
                      >
                        <div className="w-full">
                          <div className="font-medium text-xs mb-1">{preset.name}</div>
                          <div className="text-xs opacity-70 line-clamp-2">{preset.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  {customDemoData && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Selected: <span className="font-medium">{selectedPreset}</span> • {customDemoData.emails.length} emails, {customDemoData.calendar.length} events
                    </div>
                  )}
                  
                  {/* Integrated Demo Data Editor */}
                  <DemoDataEditor
                    isDemo={isDemo}
                    onDataChange={handleDemoDataChange}
                    currentEmails={customDemoData?.emails || []}
                    currentCalendar={customDemoData?.calendar || []}
                  />
                </div>
              )}

              {/* Generate Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleGenerateDigest}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Generating your digest...
                    </>
                  ) : (
                    "Generate Today's Digest"
                  )}
                </Button>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Loading State */}
          {isGenerating && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-pulse text-sm text-slate-600 dark:text-slate-400">
                      🤖 Processing emails with AI...
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      This may take 30-60 seconds
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Player & Results */}
          {audioReady && digestData && (
            <div className="space-y-6">
              {/* Audio Player */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Your Digest is Ready!
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Processed {Array.isArray(digestData.processedEmails) ? digestData.processedEmails.length : digestData.processedEmails} emails and {Array.isArray(digestData.processedEvents) ? digestData.processedEvents.length : digestData.processedEvents} calendar events
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hidden audio element */}
                  {audioUrl && (
                    <audio
                      ref={setAudioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={() => {
                        if (audioRef && !isDragging) {
                          setCurrentTime(audioRef.currentTime);
                        }
                      }}
                      onDurationChange={() => {
                        if (audioRef) {
                          setDuration(audioRef.duration);
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (audioRef) {
                          setDuration(audioRef.duration);
                        }
                      }}
                    />
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Button size="sm" onClick={toggleAudio} disabled={!audioUrl}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    {/* Interactive Audio Progress Bar */}
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono min-w-[3rem]">
                        {formatTime(currentTime)}
                      </span>
                      <div 
                        className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 cursor-pointer relative group"
                        data-audio-progress
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onClick={handleSeek}
                      >
                        {/* Progress Fill */}
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-75"
                          style={{ 
                            width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                          }}
                        />
                        
                        {/* Scrubber Handle */}
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
                          style={{ 
                            left: duration > 0 ? `calc(${(currentTime / duration) * 100}% - 8px)` : '-8px',
                            pointerEvents: isDragging ? 'none' : 'auto'
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono min-w-[3rem]">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Playback Speed Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Speed:</span>
                    {[0.5, 1, 1.5, 2].map((speed) => (
                      <Button
                        key={speed}
                        size="sm"
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        onClick={() => changePlaybackSpeed(speed)}
                        disabled={!audioUrl}
                        className="min-w-[3rem]"
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadAudio} disabled={!audioUrl}>
                      <Download className="h-4 w-4 mr-1" />
                      Download MP3
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyText}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Text
                    </Button>
                  </div>

                  {/* Collapsible Script Section */}
                  <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                      className="w-full justify-between text-sm font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="flex items-center gap-2">
                        📊 Digest Summary
                      </span>
                      {isScriptExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {isScriptExpanded && (
                      <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {digestData.podcastScript?.replace(/\[PAUSE:(short|long)\]/g, '') || ''}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>



              {/* Generate New Digest Button */}
              <div className="text-center">
                <Button 
                  onClick={() => {
                    setAudioReady(false);
                    setDigestData(null);
                    setError(null);
                    setPlaybackSpeed(1); // Reset speed to normal
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
                  }}
                  variant="outline"
                >
                  Generate New Digest
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
