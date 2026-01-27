import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Apple } from 'lucide-react';

const isNativeApp = () => {
  return (window as any).Capacitor !== undefined || 
         navigator.userAgent.includes('Capacitor') ||
         window.location.protocol === 'capacitor:';
};

export default function Home() {
  const [_, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const isNative = isNativeApp();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1a3c34]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative overflow-hidden pt-[env(safe-area-inset-top)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-black/60 to-black z-0" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
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
            <p className="text-white/80 mt-4">Welcome, {user.firstName || user.email}!</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 w-full"
          >
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold bg-amber-500 text-black hover:bg-amber-400 shadow-lg"
              onClick={() => setLocation('/game')}
              data-testid="button-play-solo"
            >
              PLAY SOLO vs AI
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                className="w-full text-white/70 hover:text-white border border-white/20 bg-white/5 hover:bg-white/10"
                onClick={() => setLocation('/game?mode=daily')}
                data-testid="button-daily-challenge"
              >
                Daily Challenge
              </Button>
              <Button 
                variant="outline"
                className="w-full text-white/70 hover:text-white border border-white/20 bg-white/5 hover:bg-white/10"
                onClick={() => setLocation('/game?tutorial=true')}
                data-testid="button-tutorial"
              >
                How to Play
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-white/50 hover:text-white border border-white/10 bg-white/5"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              Sign Out
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-white/20 text-xs font-mono mb-2">v1.0.0 • BETA</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setLocation('/privacy')} className="text-white/30 hover:text-white/50 text-xs">Privacy</button>
            <button onClick={() => setLocation('/support')} className="text-white/30 hover:text-white/50 text-xs">Support</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden pt-[env(safe-area-inset-top)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-black/60 to-black z-0" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
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

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 w-full"
        >
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-bold bg-gold text-black hover:bg-gold/90 shadow-lg"
            onClick={() => setLocation('/game')}
            data-testid="button-play-now"
          >
            PLAY NOW
          </Button>

          {!isNative && (
            <>
              <div className="flex items-center gap-4 w-full my-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/30 text-xs">or sign in to save progress</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <button
                onClick={() => setLocation('/login')}
                className="w-full h-12 flex items-center justify-center gap-3 bg-black text-white rounded-lg font-medium text-base hover:bg-black/90 transition-colors shadow-lg border border-white/10"
                data-testid="button-sign-in-apple"
              >
                <Apple className="w-5 h-5" />
                <span>Sign In with Apple</span>
              </button>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button 
              variant="ghost" 
              className="w-full text-white/40 hover:text-white border border-white/5 bg-white/5"
              onClick={() => setLocation('/game?mode=daily')}
              data-testid="button-daily-guest"
            >
              Daily Challenge
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-white/40 hover:text-white border border-white/5 bg-white/5"
              onClick={() => setLocation('/game?tutorial=true')}
              data-testid="button-tutorial-guest"
            >
              How to Play
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 text-center pb-[env(safe-area-inset-bottom)]">
        <p className="text-white/20 text-xs font-mono mb-2">v1.0.0 • BETA</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => setLocation('/privacy')} className="text-white/30 hover:text-white/50 text-xs">Privacy</button>
          <button onClick={() => setLocation('/support')} className="text-white/30 hover:text-white/50 text-xs">Support</button>
        </div>
      </div>
    </div>
  );
}
