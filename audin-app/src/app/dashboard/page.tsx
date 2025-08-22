"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Settings, Play, Pause, Download, Copy } from "lucide-react";

export default function Dashboard() {
  const [isDemo, setIsDemo] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has API key or is in demo mode
    const demoMode = sessionStorage.getItem("audin-demo-mode");
    const storedApiKey = sessionStorage.getItem("audin-api-key");
    
    if (demoMode === "true") {
      setIsDemo(true);
    } else if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Redirect back to home if no API key or demo mode
      router.push("/");
    }
  }, [router]);

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    
    // Simulate processing time for now
    setTimeout(() => {
      setIsGenerating(false);
      setAudioReady(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                AudIn
              </h1>
              {isDemo && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  Demo Mode
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
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
                : "We'll process your latest emails and calendar events"
              }
            </p>
          </div>

          {/* Generate Button */}
          {!audioReady && (
            <Card className="max-w-md mx-auto mb-8">
              <CardContent className="pt-6">
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
                      Processing your emails...
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-1000 w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Player & Results */}
          {audioReady && (
            <div className="space-y-6">
              {/* Audio Player */}
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Today's Digest Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-0"></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">2:15</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      MP3
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Categories Preview */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      ⚡ Urgent
                      <span className="text-sm font-normal text-slate-500">(2)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>• Meeting reminder from Sarah</div>
                      <div>• Budget approval needed</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📬 What's New
                      <span className="text-sm font-normal text-slate-500">(5)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>• Weekly newsletter</div>
                      <div>• Project update from team</div>
                      <div>• Conference invitation</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🧠 Keep in Mind
                      <span className="text-sm font-normal text-slate-500">(3)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div>• Social media updates</div>
                      <div>• Marketing materials</div>
                      <div>• Personal email</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
