import React, { useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/game-store';
import { Card, EmptyPile, DeckPile } from './Card';
import { Button } from '@/components/ui/button';
import type { Card as CardType } from '@/types/game';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEngine } from '@/lib/game-engine';

export const GameBoard = () => {
  const store = useGameStore();
  const { 
    state, selectedCard, selectCard, moveCard, drawCard, endTurn,
    startSoloGame, reset, isLoading, error, isAITurnInProgress, getLocalPlayerHand,
    showMoveHints, toggleMoveHints, undoMove, canUndo
  } = store;

  useEffect(() => {
    if (!state) {
      startSoloGame();
    }
  }, []);

  // Calculate valid move targets for the selected card (must be before early return to follow hooks rules)
  const validMoveTargets = useMemo(() => {
    if (!state || !selectedCard) return { tableau: [], foundations: [] };
    
    const { tableau, foundations, players, currentPlayerIndex } = state;
    const localPlayer = players.find(p => !p.isAI);
    const localPlayerHand = localPlayer ? localPlayer.hand : [];
    
    // Find the selected card
    let card: CardType | undefined;
    if (selectedCard.location.type === 'hand') {
      card = localPlayerHand.find(c => c.id === selectedCard.cardId);
    } else if (selectedCard.location.type === 'tableau') {
      const pile = tableau[selectedCard.location.index];
      card = pile.find(c => c.id === selectedCard.cardId);
    }
    
    if (!card) return { tableau: [], foundations: [] };
    
    const validTableau: number[] = [];
    const validFoundations: number[] = [];
    
    // Check each tableau pile
    for (let i = 0; i < 4; i++) {
      const topCard = tableau[i].length > 0 ? tableau[i][tableau[i].length - 1] : undefined;
      if (GameEngine.isValidTableauMove(card, topCard)) {
        validTableau.push(i);
      }
    }
    
    // Check each foundation pile
    for (let i = 0; i < 4; i++) {
      const topCard = foundations[i].length > 0 ? foundations[i][foundations[i].length - 1] : undefined;
      if (GameEngine.isValidFoundationMove(card, topCard)) {
        validFoundations.push(i);
      }
    }
    
    return { tableau: validTableau, foundations: validFoundations };
  }, [state, selectedCard]);

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

  const { tableau, foundations, deck, score, moves, isWon, players, currentPlayerIndex, round, winner } = state;
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = !currentPlayer.isAI;
  const localPlayerHand = getLocalPlayerHand();
  const opponents = players.filter(p => p.isAI);

  const isValidTarget = (type: 'tableau' | 'foundation', index: number) => {
    if (!showMoveHints) return false;
    if (type === 'tableau') return validMoveTargets.tableau.includes(index);
    if (type === 'foundation') return validMoveTargets.foundations.includes(index);
    return false;
  };

  const handleCardClick = async (card: CardType, location: { type: 'tableau' | 'foundation' | 'hand', index: number }) => {
    if (isAITurnInProgress || !isMyTurn) return;
    
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
    if (isAITurnInProgress || !isMyTurn) return;
    
    if (selectedCard) {
      await moveCard(selectedCard.location, location, selectedCard.cardId);
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full relative select-none touch-pan-x touch-pan-y-none overscroll-none bg-gradient-to-b from-[#1a3c34] to-[#0f2620]"
      role="application"
      aria-label="Kings Corner card game"
    >
      {/* Header with turn info */}
      <header className="flex justify-between items-center px-3 py-2 pt-[env(safe-area-inset-top)] text-white text-sm font-mono bg-black/30 backdrop-blur-sm border-b border-white/10 shrink-0 z-20">
        <div className="flex flex-col" role="status" aria-live="polite">
          <div className="flex gap-3 items-center">
            <span className="text-amber-400 font-bold">Round {round}</span>
            <span className="text-white/60" aria-hidden="true">•</span>
            <span className={cn(
              "font-bold",
              isMyTurn ? "text-emerald-400" : "text-orange-400"
            )}>
              {currentPlayer.name}'s Turn
            </span>
          </div>
          <div className="flex gap-3 text-xs text-white">
            <span>Your Cards: {localPlayerHand.length}</span>
            {opponents.map((opp) => (
              <span key={opp.id}>
                <span className="mx-1" aria-hidden="true">•</span>
                {opp.name}: {opp.hand.length}
              </span>
            ))}
          </div>
        </div>
        <nav className="flex items-center gap-2" aria-label="Game controls">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleMoveHints}
            aria-pressed={showMoveHints}
            aria-label={showMoveHints ? "Turn off move hints" : "Turn on move hints"}
            className={cn(
              "min-h-[44px] min-w-[80px] text-xs px-3 font-semibold",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              showMoveHints ? "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-400/10" : "text-white hover:text-white hover:bg-white/10"
            )}
            data-testid="toggle-hints"
          >
            {showMoveHints ? "HINTS ON" : "HINTS OFF"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={reset}
            aria-label="Start a new game"
            className="min-h-[44px] min-w-[80px] text-xs px-3 font-semibold text-white hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            NEW GAME
          </Button>
        </nav>
      </header>

      {/* AI Turn Indicator */}
      <AnimatePresence>
        {isAITurnInProgress && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
            aria-live="assertive"
            className="absolute top-28 left-1/2 -translate-x-1/2 z-50 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          >
            <span aria-hidden="true">🤖</span> Bot is thinking...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <main 
        className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden relative"
        aria-label="Game board with 4 corner piles and 4 main piles"
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-6 w-full max-w-[380px] md:max-w-[550px] aspect-square">
          
          {/* Row 1: TL Foundation, Top Tableau, TR Foundation */}
          <div className="flex justify-center items-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {foundations[0].length === 0 ? (
                <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 0 })} isHighlighted={isValidTarget('foundation', 0)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <Card card={foundations[0][foundations[0].length - 1]} onClick={() => handleCardClick(foundations[0][foundations[0].length - 1], { type: 'foundation', index: 0 })} isSelected={selectedCard?.cardId === foundations[0][foundations[0].length - 1].id} isHighlighted={isValidTarget('foundation', 0)} className="w-14 h-20 md:w-20 md:h-28" />
              )}
            </div>
          </div>
          
          <div className="flex justify-center items-center overflow-visible z-10">
            <div className="relative w-full h-full flex justify-center">
              {tableau[0].length === 0 ? (
                <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 0 })} isHighlighted={isValidTarget('tableau', 0)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <div className="relative">
                  {tableau[0].map((card, idx) => (
                    <div key={card.id} style={{ position: 'absolute', top: idx * 16, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                      <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 0 })} isSelected={selectedCard?.cardId === card.id} isHighlighted={idx === tableau[0].length - 1 && isValidTarget('tableau', 0)} className="w-14 h-20 md:w-20 md:h-28" />
                    </div>
                  ))}
                  <div className="w-14 h-20 md:w-20 md:h-28 opacity-0 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {foundations[1].length === 0 ? (
                <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 1 })} isHighlighted={isValidTarget('foundation', 1)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <Card card={foundations[1][foundations[1].length - 1]} onClick={() => handleCardClick(foundations[1][foundations[1].length - 1], { type: 'foundation', index: 1 })} isSelected={selectedCard?.cardId === foundations[1][foundations[1].length - 1].id} isHighlighted={isValidTarget('foundation', 1)} className="w-14 h-20 md:w-20 md:h-28" />
              )}
            </div>
          </div>

          {/* Row 2: Left Tableau, Deck, Right Tableau */}
          <div className="flex justify-center items-center overflow-visible z-20">
            <div className="relative w-full h-full flex justify-center">
              {tableau[1].length === 0 ? (
                <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 1 })} isHighlighted={isValidTarget('tableau', 1)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <div className="relative">
                  {tableau[1].map((card, idx) => (
                    <div key={card.id} style={{ position: 'absolute', top: idx * 16, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                      <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 1 })} isSelected={selectedCard?.cardId === card.id} isHighlighted={idx === tableau[1].length - 1 && isValidTarget('tableau', 1)} className="w-14 h-20 md:w-20 md:h-28" />
                    </div>
                  ))}
                  <div className="w-14 h-20 md:w-20 md:h-28 opacity-0 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center z-0">
            <DeckPile count={deck.length} onClick={isMyTurn && !isAITurnInProgress ? drawCard : undefined} className="w-14 h-20 md:w-20 md:h-28" />
          </div>

          <div className="flex justify-center items-center overflow-visible z-20">
            <div className="relative w-full h-full flex justify-center">
              {tableau[2].length === 0 ? (
                <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 2 })} isHighlighted={isValidTarget('tableau', 2)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <div className="relative">
                  {tableau[2].map((card, idx) => (
                    <div key={card.id} style={{ position: 'absolute', top: idx * 16, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                      <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 2 })} isSelected={selectedCard?.cardId === card.id} isHighlighted={idx === tableau[2].length - 1 && isValidTarget('tableau', 2)} className="w-14 h-20 md:w-20 md:h-28" />
                    </div>
                  ))}
                  <div className="w-14 h-20 md:w-20 md:h-28 opacity-0 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Row 3: BL Foundation, Bottom Tableau, BR Foundation */}
          <div className="flex justify-center items-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {foundations[2].length === 0 ? (
                <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 2 })} isHighlighted={isValidTarget('foundation', 2)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <Card card={foundations[2][foundations[2].length - 1]} onClick={() => handleCardClick(foundations[2][foundations[2].length - 1], { type: 'foundation', index: 2 })} isSelected={selectedCard?.cardId === foundations[2][foundations[2].length - 1].id} isHighlighted={isValidTarget('foundation', 2)} className="w-14 h-20 md:w-20 md:h-28" />
              )}
            </div>
          </div>
          
          <div className="flex justify-center items-center overflow-visible z-10">
            <div className="relative w-full h-full flex justify-center">
              {tableau[3].length === 0 ? (
                <EmptyPile type="tableau" onClick={() => handleEmptyClick({ type: 'tableau', index: 3 })} isHighlighted={isValidTarget('tableau', 3)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <div className="relative">
                  {tableau[3].map((card, idx) => (
                    <div key={card.id} style={{ position: 'absolute', top: idx * 16, zIndex: idx }} className="left-1/2 -translate-x-1/2">
                      <Card card={card} onClick={() => handleCardClick(card, { type: 'tableau', index: 3 })} isSelected={selectedCard?.cardId === card.id} isHighlighted={idx === tableau[3].length - 1 && isValidTarget('tableau', 3)} className="w-14 h-20 md:w-20 md:h-28" />
                    </div>
                  ))}
                  <div className="w-14 h-20 md:w-20 md:h-28 opacity-0 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {foundations[3].length === 0 ? (
                <EmptyPile type="foundation" onClick={() => handleEmptyClick({ type: 'foundation', index: 3 })} isHighlighted={isValidTarget('foundation', 3)} className="w-14 h-20 md:w-20 md:h-28" />
              ) : (
                <Card card={foundations[3][foundations[3].length - 1]} onClick={() => handleCardClick(foundations[3][foundations[3].length - 1], { type: 'foundation', index: 3 })} isSelected={selectedCard?.cardId === foundations[3][foundations[3].length - 1].id} isHighlighted={isValidTarget('foundation', 3)} className="w-14 h-20 md:w-20 md:h-28" />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Player Hand */}
      <section 
        aria-label="Your hand" 
        className="min-h-[140px] bg-black/40 backdrop-blur-md border-t border-white/10 flex flex-col items-center justify-center px-2 pb-[env(safe-area-inset-bottom)] shrink-0"
      >
        <div 
          className="flex items-center justify-center gap-1 overflow-x-auto max-w-full py-1 px-2"
          role="list"
          aria-label={`Your hand: ${localPlayerHand.length} cards`}
        >
          <AnimatePresence>
            {localPlayerHand.map((card, idx) => (
              <motion.div 
                key={card.id}
                role="listitem"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                className="flex-shrink-0"
              >
                <Card 
                  card={card} 
                  onClick={() => handleCardClick(card, { type: 'hand', index: idx })} 
                  isSelected={selectedCard?.cardId === card.id} 
                  className="w-11 h-[60px] md:w-14 md:h-[76px] hover:scale-105 transition-transform"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Turn Actions */}
        {isMyTurn && !isAITurnInProgress && !winner && (
          <div className="mt-1 flex items-center gap-2">
            <Button 
              onClick={undoMove}
              disabled={!canUndo()}
              aria-label="Undo your last move"
              className={cn(
                "min-h-[40px] min-w-[80px] text-sm font-bold px-3 py-2 rounded-full shadow-lg focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                canUndo() 
                  ? "bg-white/20 hover:bg-white/30 text-white" 
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
              data-testid="undo-move"
            >
              UNDO
            </Button>
            <Button 
              onClick={endTurn}
              aria-label="End your turn and draw a card"
              className="min-h-[40px] min-w-[100px] bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              data-testid="end-turn"
            >
              END TURN
            </Button>
          </div>
        )}
      </section>

      {/* Victory/Game Over Overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-result-title"
            aria-describedby="game-result-description"
            className="absolute inset-0 bg-black/85 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center p-8 bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl border border-amber-400/30 shadow-2xl max-w-sm mx-4"
            >
              <div className="text-6xl mb-4" aria-hidden="true">{winner === 'player' ? '🏆' : '🤖'}</div>
              <h2 id="game-result-title" className="text-3xl font-bold text-amber-400 mb-2">
                {winner === 'player' ? 'You Win!' : 'Bot Wins!'}
              </h2>
              <p id="game-result-description" className="text-white/80 mb-6">
                {winner === 'player' 
                  ? 'Congratulations! You cleared all your cards!' 
                  : 'Better luck next time!'}
              </p>
              <p className="text-white/60 text-sm mb-4">
                Completed in {round} rounds
              </p>
              <Button 
                onClick={reset}
                aria-label="Play another game"
                className="min-h-[48px] min-w-[140px] bg-amber-500 text-black font-bold px-8 py-3 rounded-full hover:bg-amber-400 shadow-lg focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                PLAY AGAIN
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
