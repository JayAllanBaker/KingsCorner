import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
        <h1 className="text-3xl font-serif text-gold">Terms of Service</h1>
        <p className="text-white/50 text-sm">Last Updated: January 26, 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p className="text-white/70 leading-relaxed">
            By downloading, installing, or using Kings Corner Arena, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the App.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
          <p className="text-white/70 leading-relaxed">
            Kings Corner Arena is a mobile card game application that allows users to play the classic Kings Corner card game against AI opponents, participate in daily challenges, track gameplay statistics, and compete on leaderboards.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
          <p className="text-white/70 leading-relaxed">
            You may create an account using Sign in with Apple or play as a guest. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">4. Acceptable Use</h2>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Do not use the App for any unlawful purpose</li>
            <li>Do not attempt to gain unauthorized access to our systems</li>
            <li>Do not interfere with other users' enjoyment of the App</li>
            <li>Do not exploit bugs or vulnerabilities</li>
            <li>Do not use automated systems or bots</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
          <p className="text-white/70 leading-relaxed">
            The App, including its design, graphics, animations, and code, is owned by us and protected by intellectual property laws. You may not copy, modify, or distribute any part of the App without permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">6. Disclaimer of Warranties</h2>
          <p className="text-white/70 leading-relaxed">
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE OPERATION.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">7. Contact</h2>
          <p className="text-white/70">
            For questions about these Terms, contact us at legal@kingscornerarena.com
          </p>
        </section>
      </div>
    </div>
  );
}
