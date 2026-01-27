import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import type { Card as CardType, Suit } from '@/types/game';
import { cn } from '@/lib/utils';
import { hapticSelection } from '@/lib/haptics';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (info: PanInfo) => void;
  isDraggable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const suitNames: Record<Suit, string> = {
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
  spades: 'Spades',
};

const rankNames: Record<string, string> = {
  'A': 'Ace',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
  '10': 'Ten',
  'J': 'Jack',
  'Q': 'Queen',
  'K': 'King',
};

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
  
  return <span className={sizes[size]} aria-hidden="true">{symbols[suit]}</span>;
};

export const Card = ({ card, isSelected, isHighlighted, onClick, onDragStart, onDragEnd, isDraggable = false, style, className }: CardProps) => {
  const isRed = card.color === 'red';
  const isDragging = React.useRef(false);
  
  const handleClick = () => {
    if (!isDragging.current) {
      hapticSelection();
      onClick?.();
    }
    isDragging.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleDragStart = () => {
    isDragging.current = true;
    hapticSelection();
    onDragStart?.();
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onDragEnd?.(info);
  };

  const cardLabel = card.faceUp 
    ? `${rankNames[card.rank]} of ${suitNames[card.suit]}${isSelected ? ', selected' : ''}${isHighlighted ? ', valid move target' : ''}`
    : 'Face down card';
  
  return (
    <motion.div
      layoutId={card.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      drag={isDraggable}
      dragSnapToOrigin={true}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      tabIndex={0}
      role="button"
      aria-label={cardLabel}
      aria-pressed={isSelected}
      className={cn(
        "relative rounded-xl select-none touch-manipulation overflow-hidden",
        "flex flex-col justify-between",
        "bg-gradient-to-br from-white via-gray-50 to-gray-100",
        "shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]",
        "border border-gray-200/80",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isSelected && "ring-4 ring-amber-500 ring-offset-2 ring-offset-[#1a3c34] scale-110 z-50 shadow-2xl",
        isHighlighted && !isSelected && "ring-3 ring-emerald-500 ring-offset-1 ring-offset-[#1a3c34]",
        "transition-shadow duration-200",
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        "min-w-[44px] min-h-[44px]",
        className
      )}
      style={style}
      whileHover={{ scale: isDraggable ? 1.05 : 1.02 }}
      whileTap={{ scale: isDraggable ? 1.08 : 0.97 }}
      whileDrag={{ scale: 1.15, zIndex: 100, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
      data-testid={`card-${card.id}`}
    >
      {card.faceUp ? (
        <>
          <div className="p-1.5 flex flex-col items-start">
            <span className={cn(
              "text-lg font-bold leading-none",
              isRed ? "text-red-600" : "text-gray-900"
            )}>
              {card.rank}
            </span>
            <span className={cn(
              "text-sm leading-none",
              isRed ? "text-red-600" : "text-gray-900"
            )}>
              <SuitSymbol suit={card.suit} size="sm" />
            </span>
          </div>

          <div className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            isRed ? "text-red-600/20" : "text-gray-900/15"
          )}>
            <SuitSymbol suit={card.suit} size="xl" />
          </div>

          <div className="p-1.5 flex flex-col items-end rotate-180">
            <span className={cn(
              "text-lg font-bold leading-none",
              isRed ? "text-red-600" : "text-gray-900"
            )}>
              {card.rank}
            </span>
            <span className={cn(
              "text-sm leading-none",
              isRed ? "text-red-600" : "text-gray-900"
            )}>
              <SuitSymbol suit={card.suit} size="sm" />
            </span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-xl flex items-center justify-center">
          <div className="absolute inset-1 rounded-lg border border-amber-400/30" />
          <div className="absolute inset-2 rounded-md border border-amber-400/20" />
          <div className="w-8 h-8 rounded-full border-2 border-amber-400/40 flex items-center justify-center">
            <span className="text-amber-400/60 text-lg" aria-hidden="true">♔</span>
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const pileLabels = {
    foundation: 'Empty corner pile (Kings start here)',
    tableau: 'Empty main pile',
    waste: 'Empty waste pile',
  };
  
  return (
    <motion.div 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${pileLabels[type]}${isHighlighted ? ', valid move target' : ''}`}
      className={cn(
        "rounded-xl border-2 border-dashed transition-all duration-200",
        "flex items-center justify-center",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isHighlighted 
          ? "border-amber-500 bg-amber-500/15 shadow-[0_0_20px_rgba(251,191,36,0.3)]" 
          : "border-white/20 bg-white/5",
        "cursor-pointer active:bg-white/10 touch-manipulation",
        "hover:border-white/30 hover:bg-white/10",
        "min-w-[44px] min-h-[44px]",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`empty-pile-${type}`}
    >
      {type === 'foundation' && (
        <span className="text-white/50 text-2xl" aria-hidden="true">♔</span>
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (count === 0) {
    return (
      <motion.div 
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Deck is empty"
        className={cn(
          "rounded-xl border-2 border-dashed border-white/20",
          "flex items-center justify-center bg-white/5",
          "cursor-pointer",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "min-w-[44px] min-h-[44px]",
          className
        )}
        whileTap={{ scale: 0.95 }}
        data-testid="deck-empty"
      >
        <span className="text-white text-xs font-semibold">EMPTY</span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Draw from deck, ${count} cards remaining`}
      className={cn(
        "relative rounded-xl cursor-pointer touch-manipulation",
        "bg-gradient-to-br from-red-600 via-red-700 to-red-800",
        "shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
        "border border-red-500/50",
        "flex items-center justify-center overflow-hidden",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "min-w-[44px] min-h-[44px]",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      data-testid="deck-pile"
    >
      <div className="absolute inset-1 rounded-lg border border-white/20" />
      <div className="absolute inset-2 rounded-md border border-white/10" />
      <div className="flex flex-col items-center">
        <span className="text-white text-2xl" aria-hidden="true">♔</span>
        <span className="text-white text-xs font-bold">{count}</span>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
    </motion.div>
  );
};
