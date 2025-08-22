"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Volume2, Clock, Shield, Zap } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    if (demoMode) {
      // Store demo mode flag
      sessionStorage.setItem("audin-demo-mode", "true");
      router.push("/dashboard");
    } else if (apiKey.trim()) {
      // Store API key in session storage
      sessionStorage.setItem("audin-api-key", apiKey.trim());
      router.push("/dashboard");
    }
  };

  const isValid = demoMode || apiKey.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Radio className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              AudIn
            </h1>
          </div>

          {/* Tagline */}
          <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 font-medium">
            Your Personal Inbox Radio
          </h2>

          <p className="text-lg text-slate-700 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your unread emails and calendar events into a personalized podcast-style digest. 
            Stay productive with AI-powered audio summaries that fit your busy lifestyle.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">2-Minute Digest</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your daily inbox summary in under 2 minutes with smart categorization and pacing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All processing happens in your browser. No data stored in the cloud, ever.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <Volume2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Human-Like Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Conversational delivery with natural pauses, emphasis, and category markers.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* API Key Input Section */}
          <Card className="max-w-md mx-auto border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Get Started
              </CardTitle>
              <CardDescription>
                Enter your OpenAI API key to power your personal inbox radio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={demoMode}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your API key is stored locally and never sent to our servers
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="demo-mode"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="demo-mode" className="text-sm text-slate-600 dark:text-slate-300">
                  Try demo mode (no API key required)
                </label>
              </div>

              <Button 
                onClick={handleGetStarted}
                disabled={!isValid}
                className="w-full"
                size="lg"
              >
                {demoMode ? "Try Demo" : "Start Your Radio"}
              </Button>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">
              Perfect for...
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Morning commutes",
                "Workout sessions", 
                "Busy professionals",
                "Hands-free multitasking",
                "Productivity hackers"
              ].map((useCase) => (
                <span 
                  key={useCase}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Built with Next.js, OpenAI, and a passion for productivity</p>
        </div>
      </footer>
    </div>
  );
}
