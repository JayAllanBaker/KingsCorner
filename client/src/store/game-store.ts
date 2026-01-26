import { create } from 'zustand';
import { Card, GameEngine, PileType, Rank, RANK_VALUE, Suit } from '@/lib/game-engine';

interface MoveLocation {
  type: PileType;
  index: number; // Tableau 0-3 (N, W, E, S) | Foundations 0-3 (NW, NE, SW, SE)
}

interface GameState {
  deck: Card[];
  waste: Card[]; // We might not need waste in strict Kings Corner (usually draw to hand), but keeping for flexibility
  hand: Card[];
  tableau: Card[][]; // 4 piles: 0:Top, 1:Left, 2:Right, 3:Bottom
  foundations: Card[][]; // 4 corners: 0:TL, 1:TR, 2:BL, 3:BR
  
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
  tableau: [[], [], [], []],
  foundations: [[], [], [], []],
  
  isGameActive: false,
  isWon: false,
  score: 0,
  timeElapsed: 0,
  moves: 0,
  selectedCard: null,

  startGame: () => {
    const deck = GameEngine.createDeck();
    
    // Deal 7 cards to hand
    const hand = deck.splice(0, 7).map(c => ({...c, faceUp: true}));
    
    // Deal 1 card to each of 4 tableau piles (Cross pattern)
    // 0: Top (North), 1: Left (West), 2: Right (East), 3: Bottom (South)
    const tableau: Card[][] = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
      const card = deck.pop();
      if (card) {
        card.faceUp = true;
        tableau[i] = [card];
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
      timeElapsed: 0,
      selectedCard: null
    });
  },

  reset: () => {
    get().startGame();
  },

  drawCard: () => {
    const { deck, hand, isGameActive } = get();
    if (!isGameActive || deck.length === 0) return;

    const newDeck = [...deck];
    const card = newDeck.pop();
    
    if (card) {
      card.faceUp = true;
      set({
        deck: newDeck,
        hand: [...hand, card] // Kings Corner usually draws to hand, not waste
      });
    }
  },

  selectCard: (card, location) => {
    const current = get().selectedCard;
    if (current?.card.id === card.id) {
      set({ selectedCard: null });
      return;
    }
    set({ selectedCard: { card, location } });
  },

  moveCard: (source, destination) => {
    const state = get();
    const { tableau, foundations, waste, hand } = state;

    let sourceCards: Card[] = [];
    
    if (source.type === 'hand') {
      const index = hand.findIndex(c => c.id === state.selectedCard?.card.id);
      if (index === -1) return false;
      sourceCards = [hand[index]];
    } else if (source.type === 'tableau') {
      const sourceStack = tableau[source.index];
      const cardIndex = sourceStack.findIndex(c => c.id === state.selectedCard?.card.id);
      if (cardIndex === -1) return false;
      sourceCards = sourceStack.slice(cardIndex);
    }

    if (sourceCards.length === 0) return false;

    let isValid = false;
    let destPile: Card[] = [];

    if (destination.type === 'foundation') {
      if (sourceCards.length > 1) return false;
      destPile = foundations[destination.index];
      const topCard = destPile.length > 0 ? destPile[destPile.length - 1] : undefined;
      isValid = GameEngine.isValidFoundationMove(sourceCards[0], topCard);
    } else if (destination.type === 'tableau') {
      destPile = tableau[destination.index];
      const topCard = destPile.length > 0 ? destPile[destPile.length - 1] : undefined;
      
      if (GameEngine.isValidTableauMove(sourceCards[0], topCard)) {
        isValid = GameEngine.isValidSequence(sourceCards);
      }
    }

    if (isValid) {
      let newHand = [...hand];
      let newTableau = [...tableau];
      let newFoundations = [...foundations];

      if (source.type === 'hand') {
        newHand = newHand.filter(c => c.id !== sourceCards[0].id);
      } else if (source.type === 'tableau') {
        newTableau[source.index] = newTableau[source.index].slice(0, newTableau[source.index].length - sourceCards.length);
      }

      if (destination.type === 'foundation') {
        newFoundations[destination.index] = [...newFoundations[destination.index], sourceCards[0]];
      } else if (destination.type === 'tableau') {
        newTableau[destination.index] = [...newTableau[destination.index], ...sourceCards];
      }

      const isWon = newHand.length === 0;

      set({
        hand: newHand,
        tableau: newTableau,
        foundations: newFoundations,
        selectedCard: null,
        moves: state.moves + 1,
        score: state.score + (destination.type === 'foundation' ? 100 : 0),
        isWon
      });
      
      return true;
    }

    return false;
  },

  autoMove: () => {}
}));
