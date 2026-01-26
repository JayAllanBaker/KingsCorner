import React, { useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { Card, EmptyPile, DeckPile } from './Card';
import { Button } from '@/components/ui/button';
import type { Card as CardType } from '@/types/game';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const GameBoard = () => {
  const store = useGameStore();
  const { 
    state, selectedCard, selectCard, moveCard, drawCard,
    startSoloGame, reset, isLoading, error
  } = store;

  useEffect(() => {
    if (!state) {
      startSoloGame();
    }
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#1a3c34] text-white">
        <div className="text-center space-y-4">
          <div className="text-xl">Loading game...</div>
          {error && <div className="text-red-400">{error}</div>}
        </div>
      </div>
    );
  }

  const { tableau, foundations, deck, hand, score, moves, isWon } = state;

  const handleCardClick = async (card: CardType, location: { type: 'tableau' | 'foundation' | 'hand', index: number }) => {
    if (selectedCard) {
      if (selectedCard.cardId === card.id) {
        selectCard(card.id, location);
      } else {
        const success = await moveCard(selectedCard.location, location, selectedCard.cardId);
        if (!success) {
          selectCard(card.id, location);
        }
      }
    } else {
      selectCard(card.id, location);
    }
  };

  const handleEmptyClick = async (location: { type: 'tableau' | 'foundation', index: number }) => {
    if (selectedCard) {
      await moveCard(selectedCard.location, location, selectedCard.cardId);
    }
  };

  // 3x3 Grid Layout mapping
  // 0  1  2
  // 3  4  5
  // 6  7  8
  //
  // 0: TL (Found 0) | 1: Top (Tab 0) | 2: TR (Found 1)
  // 3: Left (Tab 1) | 4: Deck        | 5: Right (Tab 2)
  // 6: BL (Found 2) | 7: Bottom (Tab 3) | 8: BR (Found 3)

  return (
    <div className="flex flex-col h-full w-full relative select-none touch-pan-x touch-pan-y-none overscroll-none bg-[#1a3c34]">
      {/* Header with safe area */}
      <div className="flex justify-between items-center px-4 py-2 pt-14 text-white/80 text-sm font-mono bg-black/20 backdrop-blur-sm border-b border-white/5 shrink-0 z-20">
        <div className="flex gap-4">
          <span>SCORE: {score}</span>
          <span>MOVES: {moves}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-white hover:bg-white/10 h-8">
          RESTART
        </Button>
      </div>

      {/* Main Game Area - Centered 3x3 Grid */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden relative">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-8 w-full max-w-[400px] md:max-w-[600px] aspect-square">
          
          {/* Row 1: TL Foundation, Top Tableau, TR Foundation */}
          <div className="flex justify-center items-center">
            {/* Foundation 0 (TL) */}
             <div className="relative w-full h-full flex items-center justify-center">
                {foundations[0].length === 0 ? (
                  <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 0 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'foundation' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <Card card={foundations[0][foundations[0].length - 1]} onClick={() => handleCardClick(foundations[0][foundations[0].length - 1], { type: 'foundation', index: 0 })} isSelected={selectedCard?.cardId === foundations[0][foundations[0].length - 1].id} className="w-16 h-24 md:w-24 md:h-36" />
                )}
             </div>
          </div>
          
          <div className="flex justify-center items-center overflow-visible z-10">
            {/* Tableau 0 (Top) */}
             <div className="relative w-full h-full flex justify-center">
                {tableau[0].length === 0 ? (
                  <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 0 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'tableau' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <div className="relative">
                    {tableau[0].map((card, idx) => (
                      <div key={card.id} style={{ position: 'absolute', top: idx * 20, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                         <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 0 })} isSelected={selectedCard?.cardId === card.id} className="w-16 h-24 md:w-24 md:h-36" />
                      </div>
                    ))}
                    {/* Placeholder to reserve space if needed, though absolute positioning handles the stack */}
                    <div className="w-16 h-24 md:w-24 md:h-36 opacity-0 pointer-events-none" />
                  </div>
                )}
             </div>
          </div>

          <div className="flex justify-center items-center">
            {/* Foundation 1 (TR) */}
             <div className="relative w-full h-full flex items-center justify-center">
                {foundations[1].length === 0 ? (
                  <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 1 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'foundation' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <Card card={foundations[1][foundations[1].length - 1]} onClick={() => handleCardClick(foundations[1][foundations[1].length - 1], { type: 'foundation', index: 1 })} isSelected={selectedCard?.cardId === foundations[1][foundations[1].length - 1].id} className="w-16 h-24 md:w-24 md:h-36" />
                )}
             </div>
          </div>


          {/* Row 2: Left Tableau, Deck, Right Tableau */}
          <div className="flex justify-center items-center overflow-visible z-20">
             {/* Tableau 1 (Left) */}
             <div className="relative w-full h-full flex justify-center">
                {tableau[1].length === 0 ? (
                  <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 1 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'tableau' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <div className="relative">
                    {tableau[1].map((card, idx) => (
                      <div key={card.id} style={{ position: 'absolute', top: idx * 20, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                         <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 1 })} isSelected={selectedCard?.cardId === card.id} className="w-16 h-24 md:w-24 md:h-36" />
                      </div>
                    ))}
                    <div className="w-16 h-24 md:w-24 md:h-36 opacity-0 pointer-events-none" />
                  </div>
                )}
             </div>
          </div>

          <div className="flex justify-center items-center z-0">
            {/* Deck (Center) */}
            <DeckPile count={deck.length} onClick={drawCard} className="w-16 h-24 md:w-24 md:h-36" />
          </div>

          <div className="flex justify-center items-center overflow-visible z-20">
             {/* Tableau 2 (Right) */}
             <div className="relative w-full h-full flex justify-center">
                {tableau[2].length === 0 ? (
                  <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 2 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'tableau' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <div className="relative">
                    {tableau[2].map((card, idx) => (
                      <div key={card.id} style={{ position: 'absolute', top: idx * 20, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                         <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 2 })} isSelected={selectedCard?.cardId === card.id} className="w-16 h-24 md:w-24 md:h-36" />
                      </div>
                    ))}
                     <div className="w-16 h-24 md:w-24 md:h-36 opacity-0 pointer-events-none" />
                  </div>
                )}
             </div>
          </div>


          {/* Row 3: BL Foundation, Bottom Tableau, BR Foundation */}
          <div className="flex justify-center items-center">
            {/* Foundation 2 (BL) */}
             <div className="relative w-full h-full flex items-center justify-center">
                {foundations[2].length === 0 ? (
                  <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 2 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'foundation' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <Card card={foundations[2][foundations[2].length - 1]} onClick={() => handleCardClick(foundations[2][foundations[2].length - 1], { type: 'foundation', index: 2 })} isSelected={selectedCard?.cardId === foundations[2][foundations[2].length - 1].id} className="w-16 h-24 md:w-24 md:h-36" />
                )}
             </div>
          </div>

          <div className="flex justify-center items-center overflow-visible z-30">
            {/* Tableau 3 (Bottom) */}
             <div className="relative w-full h-full flex justify-center">
                {tableau[3].length === 0 ? (
                  <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 3 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'tableau' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <div className="relative">
                    {tableau[3].map((card, idx) => (
                      <div key={card.id} style={{ position: 'absolute', top: idx * 20, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                         <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 3 })} isSelected={selectedCard?.cardId === card.id} className="w-16 h-24 md:w-24 md:h-36" />
                      </div>
                    ))}
                    <div className="w-16 h-24 md:w-24 md:h-36 opacity-0 pointer-events-none" />
                  </div>
                )}
             </div>
          </div>

          <div className="flex justify-center items-center">
            {/* Foundation 3 (BR) */}
             <div className="relative w-full h-full flex items-center justify-center">
                {foundations[3].length === 0 ? (
                  <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 3 })} isHighlighted={selectedCard ? selectedCard.location.type !== 'foundation' : false} className="w-16 h-24 md:w-24 md:h-36" />
                ) : (
                  <Card card={foundations[3][foundations[3].length - 1]} onClick={() => handleCardClick(foundations[3][foundations[3].length - 1], { type: 'foundation', index: 3 })} isSelected={selectedCard?.cardId === foundations[3][foundations[3].length - 1].id} className="w-16 h-24 md:w-24 md:h-36" />
                )}
             </div>
          </div>

        </div>
      </div>

      {/* Hand Area - Fixed Bottom */}
      <div className="h-28 md:h-36 -mx-2 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center px-4 overflow-x-auto no-scrollbar shrink-0 touch-pan-x z-40">
        <div className="flex gap-[-1.5rem] min-w-max items-center justify-center w-full px-4">
          <AnimatePresence>
          {hand.map((card, i) => (
            <motion.div 
              key={card.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50, scale: 0.5 }}
              transition={{ delay: i * 0.05 }}
              className="-ml-8 first:ml-0 active:-translate-y-4 md:hover:-translate-y-4 transition-transform z-10 active:z-20 md:hover:z-20 touch-manipulation"
            >
              <Card 
                card={card} 
                onClick={() => handleCardClick(card, { type: 'hand', index: 0 })}
                isSelected={selectedCard?.cardId === card.id}
                className="w-20 h-28 md:w-24 md:h-36 shadow-2xl"
              />
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Won Overlay */}
      {isWon && (
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
