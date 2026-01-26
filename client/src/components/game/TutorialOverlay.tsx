import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowRight, Check } from 'lucide-react';

export const TutorialOverlay = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Kings Corner",
      description: "The goal is to move all your cards to the four corner foundations.",
      image: "♔"
    },
    {
      title: "Foundations (Corners)",
      description: "Build DOWN in the SAME SUIT from King to Ace. (e.g., King of Hearts -> Queen of Hearts).",
      image: "♥"
    },
    {
      title: "Tableau (Center)",
      description: "Build DOWN in ALTERNATING COLORS. (e.g., Red King -> Black Queen -> Red Jack).",
      image: "♠ ♥"
    },
    {
      title: "Empty Spaces",
      description: "Empty columns in the tableau can only be filled with a KING.",
      image: "K"
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onOpenChange(false);
      setStep(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0b1411] border-gold/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gold font-serif">{currentStep.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6 gap-4">
          <div className="text-6xl text-white/20 animate-pulse">{currentStep.image}</div>
          <DialogDescription className="text-center text-lg text-white/90">
            {currentStep.description}
          </DialogDescription>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full items-center">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i === step ? 'bg-gold' : 'bg-white/10'}`} />
              ))}
            </div>
            <Button onClick={handleNext} className="bg-gold text-black hover:bg-gold/90">
              {step === steps.length - 1 ? (
                <>Play <Check className="ml-2 w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
