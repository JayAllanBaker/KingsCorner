import React from 'react';
import { motion } from 'framer-motion';
import type { Card as CardType, Suit } from '@/types/game';
import { cn } from '@/lib/utils';
import { hapticSelection } from '@/lib/haptics';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const SuitSymbol = ({ suit, size = 'md' }: { suit: Suit, size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  
  const sizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };
  
  return <span className={sizes[size]}>{symbols[suit]}</span>;
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
        "relative rounded-xl select-none cursor-pointer touch-manipulation overflow-hidden",
        "flex flex-col justify-between",
        "bg-gradient-to-br from-white via-gray-50 to-gray-100",
        "shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]",
        "border border-gray-200/80",
        isSelected && "ring-3 ring-amber-400 ring-offset-2 ring-offset-[#1a3c34] scale-105 z-20 -translate-y-2",
        "transition-shadow duration-200",
        className
      )}
      style={style}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      data-testid={`card-${card.id}`}
    >
      {card.faceUp ? (
        <>
          <div className="p-1.5 flex flex-col items-start">
            <span className={cn(
              "text-lg font-bold leading-none",
              isRed ? "text-red-500" : "text-slate-800"
            )}>
              {card.rank}
            </span>
            <span className={cn(
              "text-sm leading-none",
              isRed ? "text-red-500" : "text-slate-800"
            )}>
              <SuitSymbol suit={card.suit} size="sm" />
            </span>
          </div>

          <div className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            isRed ? "text-red-500/20" : "text-slate-800/15"
          )}>
            <SuitSymbol suit={card.suit} size="xl" />
          </div>

          <div className="p-1.5 flex flex-col items-end rotate-180">
            <span className={cn(
              "text-lg font-bold leading-none",
              isRed ? "text-red-500" : "text-slate-800"
            )}>
              {card.rank}
            </span>
            <span className={cn(
              "text-sm leading-none",
              isRed ? "text-red-500" : "text-slate-800"
            )}>
              <SuitSymbol suit={card.suit} size="sm" />
            </span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-xl flex items-center justify-center">
          <div className="absolute inset-1 rounded-lg border border-gold/30" />
          <div className="absolute inset-2 rounded-md border border-gold/20" />
          <div className="w-8 h-8 rounded-full border-2 border-gold/40 flex items-center justify-center">
            <span className="text-gold/60 text-lg">♔</span>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.3)_100%)]" />
        </div>
      )}
    </motion.div>
  );
};

export const EmptyPile = ({ type, onClick, isHighlighted, className }: { 
  type: 'foundation' | 'tableau' | 'waste', 
  onClick?: () => void, 
  isHighlighted?: boolean, 
  className?: string 
}) => {
  const handleClick = () => {
    hapticSelection();
    onClick?.();
  };
  
  return (
    <motion.div 
      onClick={handleClick}
      className={cn(
        "rounded-xl border-2 border-dashed transition-all duration-200",
        "flex items-center justify-center",
        isHighlighted 
          ? "border-amber-400/70 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]" 
          : "border-white/15 bg-white/5",
        "cursor-pointer active:bg-white/10 touch-manipulation",
        "hover:border-white/25 hover:bg-white/8",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`empty-pile-${type}`}
    >
      {type === 'foundation' && (
        <span className="text-white/20 text-2xl">♔</span>
      )}
    </motion.div>
  );
};

export const DeckPile = ({ count, onClick, className }: { 
  count: number, 
  onClick?: () => void, 
  className?: string 
}) => {
  const handleClick = () => {
    hapticSelection();
    onClick?.();
  };

  if (count === 0) {
    return (
      <motion.div 
        onClick={handleClick}
        className={cn(
          "rounded-xl border-2 border-dashed border-white/15",
          "flex items-center justify-center bg-white/5",
          "cursor-pointer",
          className
        )}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white/30 text-xs">EMPTY</span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      onClick={handleClick}
      className={cn(
        "relative rounded-xl cursor-pointer touch-manipulation",
        "bg-gradient-to-br from-red-600 via-red-700 to-red-800",
        "shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
        "border border-red-500/50",
        "flex items-center justify-center overflow-hidden",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute inset-1 rounded-lg border border-white/20" />
      <div className="absolute inset-2 rounded-md border border-white/10" />
      <div className="flex flex-col items-center">
        <span className="text-white/80 text-2xl">♔</span>
        <span className="text-white/60 text-xs font-mono">{count}</span>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
    </motion.div>
  );
};
