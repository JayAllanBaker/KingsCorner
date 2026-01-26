import React from 'react';
import { motion } from 'framer-motion';
import type { Card as CardType, Suit } from '@/types/game';
import { cn } from '@/lib/utils';
import { hapticSelection } from '@/lib/haptics';
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
  
  const handleClick = () => {
    hapticSelection();
    onClick?.();
  };
  
  return (
    <motion.div
      layoutId={card.id}
      onClick={handleClick}
      className={cn(
        "relative rounded-lg bg-white border border-gray-200 select-none cursor-pointer touch-manipulation",
        "flex flex-col justify-between p-1 md:p-1.5",
        "card-shadow",
        isSelected && "ring-4 ring-primary ring-offset-2 ring-offset-[#0b1411] z-10 translate-y-[-8px]",
        className
      )}
      style={style}
      whileTap={{ scale: 0.95 }}
      data-testid={`card-${card.id}`}
    >
      {/* Top Left Rank/Suit */}
      <div className={cn("flex flex-col items-center leading-none", isRed ? "text-red-600" : "text-slate-900")}>
        <span className="text-sm md:text-base font-bold font-serif tracking-tighter">{card.rank}</span>
        <SuitIcon suit={card.suit} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
      </div>

      {/* Center Suit */}
      <div className={cn("absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none", isRed ? "text-red-600" : "text-slate-900")}>
        <SuitIcon suit={card.suit} className="w-8 h-8 md:w-10 md:h-10" />
      </div>

      {/* Bottom Right Rank/Suit (Rotated) */}
      <div className={cn("flex flex-col items-center leading-none rotate-180", isRed ? "text-red-600" : "text-slate-900")}>
        <span className="text-sm md:text-base font-bold font-serif tracking-tighter">{card.rank}</span>
        <SuitIcon suit={card.suit} className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
      </div>
      
      {/* Face Down Overlay */}
      {!card.faceUp && (
        <div className="absolute inset-0 bg-emerald-800 rounded-lg border-2 border-white/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-gold opacity-50" />
        </div>
      )}
    </motion.div>
  );
};

export const EmptyPile = ({ type, onClick, isHighlighted, className }: { type: 'foundation' | 'tableau' | 'waste', onClick?: () => void, isHighlighted?: boolean, className?: string }) => {
  const handleClick = () => {
    hapticSelection();
    onClick?.();
  };
  
  return (
    <div 
      onClick={handleClick}
      className={cn(
        "rounded-lg border-2 border-dashed transition-colors",
        "flex items-center justify-center",
        isHighlighted ? "border-primary bg-primary/10" : "border-white/10 bg-white/5",
        "cursor-pointer active:bg-white/10 touch-manipulation",
        className
      )}
      data-testid={`empty-pile-${type}`}
    >
      {type === 'foundation' && <div className="text-white/20 text-xs uppercase font-bold">K</div>}
      {type === 'tableau' && <div className="text-white/20 text-xs uppercase font-bold"></div>}
    </div>
  );
};
