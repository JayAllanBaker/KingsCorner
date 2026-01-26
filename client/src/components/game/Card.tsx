import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, Suit } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const SuitIcon = ({ suit, className }: { suit: Suit, className?: string }) => {
  switch (suit) {
    case 'hearts': return <Heart className={cn("fill-current", className)} />;
    case 'diamonds': return <Diamond className={cn("fill-current", className)} />;
    case 'clubs': return <Club className={cn("fill-current", className)} />;
    case 'spades': return <Spade className={cn("fill-current", className)} />;
  }
};

export const Card = ({ card, isSelected, onClick, style, className }: CardProps) => {
  const isRed = card.color === 'red';
  
  return (
    <motion.div
      layoutId={card.id}
      onClick={onClick}
      className={cn(
        "relative w-16 h-24 md:w-20 md:h-28 rounded-lg bg-white border border-gray-200 select-none cursor-pointer transition-transform",
        "flex flex-col justify-between p-1.5 md:p-2",
        "card-shadow",
        isSelected && "ring-4 ring-primary ring-offset-2 ring-offset-[#0b1411] z-10 translate-y-[-8px]",
        className
      )}
      style={style}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Top Left Rank/Suit */}
      <div className={cn("flex flex-col items-center leading-none", isRed ? "text-red-600" : "text-slate-900")}>
        <span className="text-base md:text-lg font-bold font-serif tracking-tighter">{card.rank}</span>
        <SuitIcon suit={card.suit} className="w-3 h-3 md:w-4 md:h-4" />
      </div>

      {/* Center Suit */}
      <div className={cn("absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none", isRed ? "text-red-600" : "text-slate-900")}>
        <SuitIcon suit={card.suit} className="w-10 h-10 md:w-12 md:h-12" />
      </div>

      {/* Bottom Right Rank/Suit (Rotated) */}
      <div className={cn("flex flex-col items-center leading-none rotate-180", isRed ? "text-red-600" : "text-slate-900")}>
        <span className="text-base md:text-lg font-bold font-serif tracking-tighter">{card.rank}</span>
        <SuitIcon suit={card.suit} className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      
      {/* Face Down Overlay (if needed, though logic handles FaceUp) */}
      {!card.faceUp && (
        <div className="absolute inset-0 bg-emerald-800 rounded-lg border-2 border-white/20 flex items-center justify-center bg-[url('/pattern.png')]">
          <div className="w-8 h-8 rounded-full border-2 border-gold opacity-50" />
        </div>
      )}
    </motion.div>
  );
};

export const EmptyPile = ({ type, onClick, isHighlighted }: { type: 'foundation' | 'tableau' | 'waste', onClick?: () => void, isHighlighted?: boolean }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "w-16 h-24 md:w-20 md:h-28 rounded-lg border-2 border-dashed transition-colors",
        "flex items-center justify-center",
        isHighlighted ? "border-primary bg-primary/10" : "border-white/10 bg-white/5",
        "cursor-pointer hover:bg-white/10"
      )}
    >
      {type === 'foundation' && <div className="text-white/20 text-xs uppercase font-bold">A</div>}
      {type === 'tableau' && <div className="text-white/20 text-xs uppercase font-bold">K</div>}
    </div>
  );
};
