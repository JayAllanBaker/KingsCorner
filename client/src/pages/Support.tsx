import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, MessageCircle, BookOpen } from 'lucide-react';

export default function Support() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0f1f1a] text-white/90 p-6 pb-20">
      <Button 
        variant="ghost" 
        onClick={() => setLocation('/')}
        className="mb-6 text-white/60 hover:text-white"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gold text-3xl">♔</span>
          </div>
          <h1 className="text-3xl font-serif text-gold">Support</h1>
          <p className="text-white/50 mt-2">How can we help you?</p>
        </div>

        <div className="grid gap-4">
          <a 
            href="mailto:support@kingscornerarena.com"
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            data-testid="link-email-support"
          >
            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Email Support</h3>
              <p className="text-white/50 text-sm">support@kingscornerarena.com</p>
            </div>
          </a>

          <button
            onClick={() => setLocation('/game?tutorial=true')}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-left w-full"
            data-testid="button-tutorial"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">How to Play</h3>
              <p className="text-white/50 text-sm">Learn the rules with our interactive tutorial</p>
            </div>
          </button>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="p-4 cursor-pointer font-medium hover:bg-white/5">
                How do I play Kings Corner?
              </summary>
              <div className="p-4 pt-0 text-white/70 text-sm">
                The goal is to empty your hand by placing cards on the tableau piles in descending order with alternating colors. Kings can be placed in the corner foundation piles. Tap a card to select it, then tap a valid destination to move it.
              </div>
            </details>

            <details className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="p-4 cursor-pointer font-medium hover:bg-white/5">
                What are the AI difficulty levels?
              </summary>
              <div className="p-4 pt-0 text-white/70 text-sm">
                <strong>Easy:</strong> The AI makes occasional suboptimal moves, great for learning.<br/>
                <strong>Standard:</strong> A balanced challenge suitable for most players.<br/>
                <strong>Hard:</strong> The AI plays optimally and will test your skills.
              </div>
            </details>

            <details className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="p-4 cursor-pointer font-medium hover:bg-white/5">
                How do Daily Challenges work?
              </summary>
              <div className="p-4 pt-0 text-white/70 text-sm">
                Every day, all players receive the same starting hand. Compete to achieve the highest score and fastest completion time. Rankings reset at midnight UTC.
              </div>
            </details>

            <details className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <summary className="p-4 cursor-pointer font-medium hover:bg-white/5">
                How do I delete my account?
              </summary>
              <div className="p-4 pt-0 text-white/70 text-sm">
                Contact us at privacy@kingscornerarena.com with your account email address. We will process your deletion request within 30 days.
              </div>
            </details>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-white/40 text-sm">
            Kings Corner Arena v1.0.0
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <button 
              onClick={() => setLocation('/privacy')}
              className="text-white/50 hover:text-white text-sm"
            >
              Privacy Policy
            </button>
            <span className="text-white/20">•</span>
            <button 
              onClick={() => setLocation('/terms')}
              className="text-white/50 hover:text-white text-sm"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
