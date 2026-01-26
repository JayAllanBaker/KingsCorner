// Server-side authoritative game engine for Kings Corner
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'red' | 'black';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  color: Color;
  faceUp: boolean;
}

export interface GameState {
  deck: Card[];
  hand: Card[];
  tableau: Card[][]; // [0: Top, 1: Left, 2: Right, 3: Bottom]
  foundations: Card[][]; // [0: TL, 1: TR, 2: BL, 3: BR]
  score: number;
  moves: number;
  isWon: boolean;
  seed?: string;
}

export interface MoveAction {
  type: 'draw' | 'move_card';
  from?: { type: 'hand' | 'tableau', index: number };
  to?: { type: 'tableau' | 'foundation', index: number };
  cardId?: string;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RANK_VALUE: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export class GameEngine {
  static createDeck(seed?: string): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: `${rank}-${suit}`,
          suit,
          rank,
          color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
          faceUp: false,
        });
      }
    }
    return this.shuffle(deck, seed);
  }

  static shuffle(deck: Card[], seed?: string): Card[] {
    const newDeck = [...deck];
    
    // Seeded random using simple hash function for deterministic shuffles
    let random = seed ? this.seededRandom(seed) : Math.random;
    
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }

  static seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    
    return function() {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }

  static initializeGame(seed?: string): GameState {
    const deck = this.createDeck(seed);
    
    // Deal 7 cards to hand
    const hand = deck.splice(0, 7).map(c => ({ ...c, faceUp: true }));
    
    // Deal 1 card to each of 4 tableau piles
    const tableau: Card[][] = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
      const card = deck.pop();
      if (card) {
        card.faceUp = true;
        tableau[i] = [card];
      }
    }

    return {
      deck,
      hand,
      tableau,
      foundations: [[], [], [], []],
      score: 0,
      moves: 0,
      isWon: false,
      seed,
    };
  }

  static isValidFoundationMove(card: Card, topCard?: Card): boolean {
    if (!topCard) {
      return card.rank === 'K';
    }
    if (card.suit !== topCard.suit) return false;
    const cardValue = RANK_VALUE[card.rank];
    const topValue = RANK_VALUE[topCard.rank];
    return topValue - cardValue === 1;
  }

  static isValidTableauMove(card: Card, topCard?: Card): boolean {
    if (!topCard) {
      return true;
    }
    if (card.color === topCard.color) return false;
    const cardValue = RANK_VALUE[card.rank];
    const topValue = RANK_VALUE[topCard.rank];
    return topValue - cardValue === 1;
  }

  static isValidSequence(cards: Card[]): boolean {
    if (cards.length <= 1) return true;
    
    for (let i = 0; i < cards.length - 1; i++) {
      const current = cards[i];
      const next = cards[i + 1];
      
      if (current.color === next.color) return false;
      if (RANK_VALUE[current.rank] - RANK_VALUE[next.rank] !== 1) return false;
    }
    return true;
  }

  static applyMove(state: GameState, action: MoveAction): { state: GameState; valid: boolean; error?: string } {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;

    if (action.type === 'draw') {
      if (newState.deck.length === 0) {
        return { state, valid: false, error: 'Deck is empty' };
      }
      const card = newState.deck.pop()!;
      card.faceUp = true;
      newState.hand.push(card);
      return { state: newState, valid: true };
    }

    if (action.type === 'move_card' && action.from && action.to && action.cardId) {
      let sourceCards: Card[] = [];
      
      // Get source cards
      if (action.from.type === 'hand') {
        const idx = newState.hand.findIndex(c => c.id === action.cardId);
        if (idx === -1) return { state, valid: false, error: 'Card not found in hand' };
        sourceCards = [newState.hand[idx]];
      } else if (action.from.type === 'tableau') {
        const pile = newState.tableau[action.from.index];
        const idx = pile.findIndex(c => c.id === action.cardId);
        if (idx === -1) return { state, valid: false, error: 'Card not found in tableau' };
        sourceCards = pile.slice(idx);
      }

      // Validate destination
      let isValid = false;
      if (action.to.type === 'foundation') {
        if (sourceCards.length > 1) {
          return { state, valid: false, error: 'Cannot move multiple cards to foundation' };
        }
        const destPile = newState.foundations[action.to.index];
        const topCard = destPile.length > 0 ? destPile[destPile.length - 1] : undefined;
        isValid = this.isValidFoundationMove(sourceCards[0], topCard);
      } else if (action.to.type === 'tableau') {
        const destPile = newState.tableau[action.to.index];
        const topCard = destPile.length > 0 ? destPile[destPile.length - 1] : undefined;
        isValid = this.isValidTableauMove(sourceCards[0], topCard) && this.isValidSequence(sourceCards);
      }

      if (!isValid) {
        return { state, valid: false, error: 'Invalid move' };
      }

      // Apply move
      if (action.from.type === 'hand') {
        newState.hand = newState.hand.filter(c => c.id !== action.cardId);
      } else if (action.from.type === 'tableau') {
        newState.tableau[action.from.index] = newState.tableau[action.from.index].slice(0, -sourceCards.length);
      }

      if (action.to.type === 'foundation') {
        newState.foundations[action.to.index].push(...sourceCards);
        newState.score += 100;
      } else if (action.to.type === 'tableau') {
        newState.tableau[action.to.index].push(...sourceCards);
      }

      newState.moves++;
      newState.isWon = newState.hand.length === 0;

      return { state: newState, valid: true };
    }

    return { state, valid: false, error: 'Invalid action' };
  }
}
