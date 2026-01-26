import { create } from 'zustand';
import { Card, GameEngine, PileType, Rank, RANK_VALUE, Suit } from '@/lib/game-engine';

interface MoveLocation {
  type: PileType;
  index: number; // For tableau columns (0-6) or foundations (0-3). Hand/Waste use 0.
}

interface GameState {
  deck: Card[];
  waste: Card[];
  hand: Card[];
  tableau: Card[][];
  foundations: Card[][];
  
  isGameActive: boolean;
  isWon: boolean;
  score: number;
  timeElapsed: number;
  moves: number;

  selectedCard: { card: Card, location: MoveLocation } | null;

  // Actions
  startGame: () => void;
  drawCard: () => void;
  selectCard: (card: Card, location: MoveLocation) => void;
  moveCard: (source: MoveLocation, destination: MoveLocation) => boolean;
  autoMove: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  deck: [],
  waste: [],
  hand: [],
  tableau: Array(7).fill([]),
  foundations: Array(4).fill([]),
  
  isGameActive: false,
  isWon: false,
  score: 0,
  timeElapsed: 0,
  moves: 0,
  selectedCard: null,

  startGame: () => {
    const deck = GameEngine.createDeck();
    
    // Deal 7 cards to hand (standard Kings Corner usually deals 7)
    const hand = deck.splice(0, 7).map(c => ({...c, faceUp: true}));
    
    // Deal 1 card to each of 4 tableau columns (Wait, prompt says "Seven tableau columns")
    // Prompt: "Seven tableau columns occupying full width"
    // Usually Kings Corner has 4, but user specified 7. I will follow prompt.
    // Let's deal 1 card to each tableau to start? Or start empty?
    // Prompt: "Four foundation piles start empty... Tableau columns build down..."
    // Usually Solitaire starts with cards. Kings Corner often starts with a cross.
    // "Deal pile provides one card at a time to waste."
    // Let's assume standard solitaire-style deal but face up? Or empty?
    // "Standard Rules: ... Empty tableau columns may be filled only by a King"
    // If they start empty, and you need a King, it's hard to start.
    // I'll assume a Solitaire-ish deal: 1 card in col 1, 2 in col 2... or just 1 face up in each.
    // Let's go with 1 face up in each of the 7 columns to be playable.
    
    const tableau: Card[][] = [];
    for (let i = 0; i < 7; i++) {
      const card = deck.pop();
      if (card) {
        card.faceUp = true;
        tableau.push([card]);
      } else {
        tableau.push([]);
      }
    }

    set({
      deck,
      hand,
      tableau,
      waste: [],
      foundations: [[], [], [], []],
      isGameActive: true,
      isWon: false,
      score: 0,
      moves: 0,
      timeElapsed: 0
    });
  },

  reset: () => {
    get().startGame();
  },

  drawCard: () => {
    const { deck, waste, isGameActive } = get();
    if (!isGameActive || deck.length === 0) return;

    const newDeck = [...deck];
    const card = newDeck.pop();
    
    if (card) {
      card.faceUp = true;
      set({
        deck: newDeck,
        waste: [...waste, card]
      });
    }
  },

  selectCard: (card, location) => {
    // If card is already selected, deselect
    const current = get().selectedCard;
    if (current?.card.id === card.id) {
      set({ selectedCard: null });
      return;
    }
    
    // Check if we can select this card (must be top of waste/hand or valid sequence in tableau)
    // For simplicity v1: only allow selecting top card or valid substacks
    set({ selectedCard: { card, location } });
  },

  moveCard: (source, destination) => {
    const state = get();
    const { tableau, foundations, waste, hand } = state;

    // Helper to get source stack
    let sourceCards: Card[] = [];
    let sourceStack: Card[] = []; // The full pile where the cards act coming from
    
    if (source.type === 'hand') {
      sourceStack = hand;
      const index = hand.findIndex(c => c.id === state.selectedCard?.card.id);
      if (index === -1) return false;
      sourceCards = [hand[index]]; // Can only move 1 from hand usually? Or sequences? Standard is 1.
    } else if (source.type === 'waste') {
      sourceStack = waste;
      if (waste.length === 0) return false;
      sourceCards = [waste[waste.length - 1]];
    } else if (source.type === 'tableau') {
      sourceStack = tableau[source.index];
      // Find the card in the stack
      const cardIndex = sourceStack.findIndex(c => c.id === state.selectedCard?.card.id);
      if (cardIndex === -1) return false;
      sourceCards = sourceStack.slice(cardIndex);
    }

    if (sourceCards.length === 0) return false;

    // Validate Move
    let isValid = false;
    let destPile: Card[] = [];

    if (destination.type === 'foundation') {
      if (sourceCards.length > 1) return false; // Can only move single cards to foundation
      destPile = foundations[destination.index];
      const topCard = destPile.length > 0 ? destPile[destPile.length - 1] : undefined;
      isValid = GameEngine.isValidFoundationMove(sourceCards[0], topCard);
    } else if (destination.type === 'tableau') {
      destPile = tableau[destination.index];
      const topCard = destPile.length > 0 ? destPile[destPile.length - 1] : undefined;
      
      // Check validation
      if (GameEngine.isValidTableauMove(sourceCards[0], topCard)) {
        // Also ensure the source sequence itself is valid (if moving a stack)
        isValid = GameEngine.isValidSequence(sourceCards);
      }
    }

    if (isValid) {
      // Execute Move
      
      // Remove from source
      let newHand = [...hand];
      let newWaste = [...waste];
      let newTableau = [...tableau];
      let newFoundations = [...foundations];

      if (source.type === 'hand') {
        newHand = newHand.filter(c => c.id !== sourceCards[0].id);
      } else if (source.type === 'waste') {
        newWaste.pop();
      } else if (source.type === 'tableau') {
        newTableau[source.index] = newTableau[source.index].slice(0, newTableau[source.index].length - sourceCards.length);
      }

      // Add to destination
      if (destination.type === 'foundation') {
        newFoundations[destination.index] = [...newFoundations[destination.index], sourceCards[0]];
      } else if (destination.type === 'tableau') {
        newTableau[destination.index] = [...newTableau[destination.index], ...sourceCards];
      }

      set({
        hand: newHand,
        waste: newWaste,
        tableau: newTableau,
        foundations: newFoundations,
        selectedCard: null,
        moves: state.moves + 1,
        // Calculate Score (Simple implementation)
        score: state.score + (destination.type === 'foundation' ? 100 : 0)
      });
      
      return true;
    }

    return false;
  },

  autoMove: () => {
    // To be implemented: Check all exposed cards and see if they can go to foundations
  }
}));
