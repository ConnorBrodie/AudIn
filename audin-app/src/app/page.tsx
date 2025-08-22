"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Volume2, Clock, Shield, Mail, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleOAuthSignIn = () => {
    // TODO: Implement OAuth flow
    console.log("OAuth sign-in clicked");
    // For now, just show an alert
    alert("OAuth integration coming soon! Use demo mode to test the app.");
  };

  const handleDemoMode = () => {
    // Store demo mode flag and navigate
    sessionStorage.setItem("audin-demo-mode", "true");
    router.push("/dashboard");
  };

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

          {/* Get Started Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Get Started
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Choose how you'd like to experience AudIn
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* OAuth Option */}
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <CardTitle className="text-xl text-center">
                    Connect Gmail
                  </CardTitle>
                  <CardDescription className="text-center">
                    Sign in with Google to access your real emails and calendar events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time email summaries
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Calendar integration
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Full personalization
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleOAuthSignIn}
                    className="w-full"
                    size="lg"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Sign in with Google
                  </Button>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Your data stays private - all processing happens in your browser
                  </p>
                </CardContent>
              </Card>

              {/* Demo Option */}
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <CardTitle className="text-xl text-center">
                    Try Demo
                  </CardTitle>
                  <CardDescription className="text-center">
                    Experience AudIn with sample emails and calendar events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Sample email content
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Mock calendar events
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Full feature preview
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDemoMode}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try Demo Mode
                  </Button>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Perfect for testing before connecting your real account
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

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
