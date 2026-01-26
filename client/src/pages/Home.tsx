import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-black/60 to-black z-0" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
        {/* Logo/Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-gold text-4xl">♔</span>
            <span className="text-gold text-4xl">♕</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold via-yellow-200 to-amber-600 drop-shadow-sm tracking-tight">
            KINGS<br/>CORNER
          </h1>
          <p className="text-white/60 font-mono tracking-widest text-sm mt-2 uppercase">Arena</p>
        </motion.div>

        {/* Menu */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 w-full"
        >
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 shadow-lg flex items-center gap-2"
            onClick={() => setLocation('/game')}
          >
            <Apple className="w-5 h-5" /> Sign in with Apple
          </Button>

          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-white/20 text-xs">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <Button 
            variant="outline"
            size="lg" 
            className="w-full h-14 text-lg border-gold/50 text-gold hover:bg-gold/10 backdrop-blur-sm"
            onClick={() => setLocation('/game')}
          >
            PLAY AS GUEST
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
             <Button 
              variant="ghost" 
              className="w-full text-white/40 hover:text-white border border-white/5 bg-white/5"
              onClick={() => setLocation('/game?mode=daily')}
            >
              Daily Challenge
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-white/40 hover:text-white border border-white/5 bg-white/5"
              onClick={() => setLocation('/game?tutorial=true')}
            >
              Tutorial
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 text-white/20 text-xs font-mono">
        v1.0.0 • PROTOTYPE
      </div>
    </div>
  );
}
