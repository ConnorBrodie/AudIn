"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Volume2, Clock, Shield, Mail, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleOAuthSignIn = () => {
    // Clear demo mode flag and initiate OAuth sign-in
    sessionStorage.removeItem("audin-demo-mode");
    signIn('google', { callbackUrl: '/dashboard' });
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
          <div className="flex items-center justify-center gap-4 mb-8 group cursor-pointer">
            <Radio className="h-16 w-16 md:h-20 md:w-20 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
              AudIn
            </h1>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 mb-6 font-medium">
            Your Day, as a 2 Minute Podcast
          </h2>

          <p className="text-lg text-slate-700 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Turn your unread emails and calendar events into a <strong><em>personalised, hands-free audio digest</em></strong> with the power of AI. Stay on top of what matters — <strong><em>all in under 2 minutes</em></strong>.
          </p>

          {/* Why AudIn Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
              Why AudIn?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardHeader className="pb-4">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2 transition-transform duration-300 hover:scale-110" />
                  <CardTitle className="text-lg">2-Minute Digest</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Start your day with a quick, informative briefing based on your unread emails and calendar, helping you stay on top.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardHeader className="pb-4">
                  <Volume2 className="h-8 w-8 text-primary mx-auto mb-2 transition-transform duration-300 hover:scale-110" />
                  <CardTitle className="text-lg">Human-Like Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AudIn uses cutting-edge text-to-speech AI models to deliver your digest in a way that feels natural.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardHeader className="pb-4">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2 transition-transform duration-300 hover:scale-110" />
                  <CardTitle className="text-lg">Privacy-Focused</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AudIn stores no data - emails are processed by AI providers and immediately discarded.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Get Started Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Get Started
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Choose how you'd like to try AudIn:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* OAuth Option */}
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-2 hover:border-primary/20">
                <CardHeader>
                  <div className="text-4xl mb-3 text-center transition-transform duration-300 hover:scale-110">🔗</div>
                  <CardTitle className="text-xl text-center">
                    Connect Gmail
                  </CardTitle>
                  <CardDescription className="text-center">
                    Sign in with Google to unlock the full experience:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time summaries of your inbox
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Calendar events woven into your daily digest
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Complete personalization
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
                    Email data may be passed to AI providers, but AudIn never stores your email data.
                  </p>
                </CardContent>
              </Card>

              {/* Demo Option */}
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-2 hover:border-primary/20">
                <CardHeader>
                  <div className="text-4xl mb-3 text-center transition-transform duration-300 hover:scale-110">🎧</div>
                  <CardTitle className="text-xl text-center">
                    Try Demo Mode
                  </CardTitle>
                  <CardDescription className="text-center">
                    Preview AudIn with sample emails and calendar events:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Mock inbox and calendar items
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Full feature walkthrough
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Perfect for testing before connecting your account
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleDemoMode}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try Demo Mode
                  </Button>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    No account needed - start exploring immediately
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Built For Section */}
          <div className="mt-16 text-center">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Built For…
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { text: "Morning commutes", emoji: "🚆" },
                { text: "Workouts", emoji: "💪" },
                { text: "Busy professionals", emoji: "👩‍💻" },
                { text: "Hands-free multitasking", emoji: "🎙️" },
                { text: "Productivity enthusiasts", emoji: "⚡" }
              ].map((item) => (
                <span 
                  key={item.text}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
                >
                  <span className="transition-transform duration-200 hover:scale-110">{item.emoji}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Built with Next.js, OpenAI, and a passion for productivity.</p>
        </div>
      </footer>
    </div>
  );
}
