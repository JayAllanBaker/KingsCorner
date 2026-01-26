import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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

      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-serif text-gold">Privacy Policy</h1>
        <p className="text-white/50 text-sm">Last Updated: January 26, 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Introduction</h2>
          <p className="text-white/70 leading-relaxed">
            Welcome to Kings Corner Arena. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
          <div className="space-y-3 text-white/70">
            <h3 className="font-medium text-white/90">Account Information</h3>
            <p>When you sign in, we may collect your unique user identifier, email address (if shared), display name, and profile image URL.</p>
            
            <h3 className="font-medium text-white/90">Gameplay Data</h3>
            <p>We collect game scores, match history, daily challenge attempts, and win/loss records to provide our services.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Provide and maintain the game service</li>
            <li>Track your progress and statistics</li>
            <li>Display leaderboard rankings</li>
            <li>Improve game performance and features</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Data Security</h2>
          <p className="text-white/70 leading-relaxed">
            Your data is stored securely using industry-standard encryption. We use PostgreSQL databases with encrypted connections to protect your information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Your Rights</h2>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Access your personal data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of optional data collection</li>
            <li>Export your gameplay data</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Contact Us</h2>
          <p className="text-white/70">
            If you have questions about this privacy policy, please contact us at privacy@kingscornerarena.com
          </p>
        </section>
      </div>
    </div>
  );
}
