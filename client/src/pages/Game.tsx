import React, { useState, useEffect } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { useLocation, useSearch } from 'wouter';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';

export default function Game() {
  const [_, setLocation] = useLocation();
  const search = useSearch();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check URL search params manually since wouter's useSearch returns a string
    const params = new URLSearchParams(search);
    if (params.get('tutorial') === 'true') {
      setShowTutorial(true);
    }
  }, [search]);

  return (
    <div className="h-full bg-[#0b1411] pt-[env(safe-area-inset-top)]">
      <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-4 z-50 flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation('/')}
          className="text-white/50 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowTutorial(true)}
          className="text-white/50 hover:text-white"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>
      
      <GameBoard />
      <TutorialOverlay open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  );
}
