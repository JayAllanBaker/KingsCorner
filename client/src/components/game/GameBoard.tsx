import React, { useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { Card, EmptyPile } from './Card';
import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const GameBoard = () => {
  const store = useGameStore();
  const { 
    tableau, foundations, waste, deck, hand, 
    selectedCard, selectCard, moveCard, drawCard,
    score, moves, timeElapsed, startGame, reset
  } = store;

  useEffect(() => {
    startGame();
  }, []);

  const handleCardClick = (card: CardType, location: { type: 'tableau' | 'foundation' | 'waste' | 'hand', index: number }) => {
    if (selectedCard) {
      if (selectedCard.card.id === card.id) {
        selectCard(card, location);
      } else {
        const success = moveCard(selectedCard.location, location);
        if (!success) {
          selectCard(card, location);
        }
      }
    } else {
      selectCard(card, location);
    }
  };

  const handleEmptyClick = (location: { type: 'tableau' | 'foundation', index: number }) => {
    if (selectedCard) {
      moveCard(selectedCard.location, location);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative select-none touch-pan-x touch-pan-y-none overscroll-none">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 text-white/80 text-sm font-mono bg-black/20 backdrop-blur-sm border-b border-white/5 shrink-0 h-12">
        <div className="flex gap-4">
          <span>SCORE: {score}</span>
          <span>MOVES: {moves}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-white hover:bg-white/10 h-8">
          RESTART
        </Button>
      </div>

      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* Top Area: Foundations & Draw/Waste */}
        {/* On mobile, this might be cramped. Let's use a responsive grid. */}
        <div className="flex justify-between items-start gap-2 shrink-0 min-h-[6rem] px-2 md:px-8">
          
          {/* Draw & Waste (Left Side) */}
          <div className="flex items-center gap-2 md:gap-4">
            <div onClick={drawCard} className="relative cursor-pointer group touch-manipulation">
              {deck.length > 0 ? (
                <div className="w-14 h-20 md:w-20 md:h-28 bg-emerald-900 rounded-lg border-2 border-white/20 shadow-xl group-active:scale-95 transition-transform flex items-center justify-center bg-[url('/pattern.png')]">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gold opacity-50" />
                  <span className="absolute -bottom-5 text-[10px] md:text-xs text-white/50 font-mono">{deck.length}</span>
                </div>
              ) : (
                <div className="w-14 h-20 md:w-20 md:h-28 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-white/20">
                  ↺
                </div>
              )}
            </div>

            <div className="relative">
               {waste.length === 0 ? (
                  <EmptyPile type="waste" className="w-14 h-20 md:w-20 md:h-28" />
                ) : (
                  <Card 
                    card={waste[waste.length - 1]} 
                    onClick={() => handleCardClick(waste[waste.length - 1], { type: 'waste', index: 0 })}
                    isSelected={selectedCard?.card.id === waste[waste.length - 1].id}
                    className="w-14 h-20 md:w-20 md:h-28"
                  />
                )}
            </div>
          </div>

          {/* Foundations (Right Side) */}
          <div className="flex gap-1 md:gap-2">
            {foundations.map((pile, i) => (
              <div key={`foundation-${i}`} className="relative">
                {pile.length === 0 ? (
                  <EmptyPile 
                    type="foundation" 
                    onClick={() => handleEmptyClick({ type: 'foundation', index: i })}
                    isHighlighted={selectedCard ? selectedCard.location.type !== 'foundation' : false} 
                    className="w-14 h-20 md:w-20 md:h-28"
                  />
                ) : (
                  <Card 
                    card={pile[pile.length - 1]} 
                    onClick={() => handleCardClick(pile[pile.length - 1], { type: 'foundation', index: i })}
                    isSelected={selectedCard?.card.id === pile[pile.length - 1].id}
                    className="w-14 h-20 md:w-20 md:h-28"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau - Scrollable Horizontal, strict snap alignment */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-2 px-2 no-scrollbar touch-pan-x snap-x snap-mandatory">
          <div className="flex gap-2 min-w-max px-2 md:justify-center md:w-full">
            {tableau.map((pile, colIndex) => (
              <div key={`tableau-${colIndex}`} className="flex flex-col gap-0 min-w-[3.5rem] md:min-w-[5rem] snap-start">
                {pile.length === 0 ? (
                  <EmptyPile 
                    type="tableau" 
                    onClick={() => handleEmptyClick({ type: 'tableau', index: colIndex })} 
                    isHighlighted={selectedCard ? selectedCard.location.type !== 'tableau' : false}
                    className="w-14 h-20 md:w-20 md:h-28"
                  />
                ) : (
                  <div className="relative flex flex-col pt-0">
                     {pile.map((card, cardIndex) => (
                       <div 
                         key={card.id} 
                         style={{ 
                           marginTop: cardIndex === 0 ? 0 : -60, // Tighter overlap
                           zIndex: cardIndex 
                         }}
                       >
                         <Card 
                           card={card} 
                           onClick={() => handleCardClick(card, { type: 'tableau', index: colIndex })}
                           isSelected={selectedCard?.card.id === card.id}
                           className="w-14 h-20 md:w-20 md:h-28"
                         />
                       </div>
                     ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hand Area - Fixed Bottom */}
        <div className="h-28 md:h-36 -mx-2 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center px-4 overflow-x-auto no-scrollbar shrink-0 touch-pan-x">
          <div className="flex gap-[-1rem] min-w-max items-center justify-center w-full px-4">
            <AnimatePresence>
            {hand.map((card, i) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50, scale: 0.5 }}
                transition={{ delay: i * 0.05 }}
                className="-ml-6 first:ml-0 active:-translate-y-4 md:hover:-translate-y-4 transition-transform z-10 active:z-20 md:hover:z-20 touch-manipulation"
              >
                <Card 
                  card={card} 
                  onClick={() => handleCardClick(card, { type: 'hand', index: 0 })}
                  isSelected={selectedCard?.card.id === card.id}
                  className="w-16 h-24 md:w-24 md:h-36 shadow-2xl"
                />
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Won Overlay */}
      {store.isWon && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm touch-none">
          <div className="text-center space-y-4 animate-in zoom-in duration-300 p-4">
            <h1 className="text-6xl font-serif text-gold mb-2">Victory!</h1>
            <p className="text-white/80">Score: {score}</p>
            <Button onClick={reset} size="lg" className="bg-gold text-black hover:bg-gold/90 font-bold w-full">
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
