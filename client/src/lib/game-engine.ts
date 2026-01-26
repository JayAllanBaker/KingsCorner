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
  tableau: Card[][];
  foundations: Card[][];
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

export type PileType = 'tableau' | 'foundation' | 'waste' | 'hand';

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
    const random = seed ? this.seededRandom(seed) : Math.random;
    
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
      hash = hash & hash;
    }
    return () => {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      return hash / 0x7fffffff;
    };
  }

  static initializeGame(seed?: string): GameState {
    const deck = this.createDeck(seed);
    
    const tableau: Card[][] = [[], [], [], []];
    const foundations: Card[][] = [[], [], [], []];
    const hand: Card[] = [];
    
    for (let i = 0; i < 4; i++) {
      const card = deck.pop()!;
      card.faceUp = true;
      tableau[i].push(card);
    }
    
    for (let i = 0; i < 7; i++) {
      const card = deck.pop()!;
      card.faceUp = true;
      hand.push(card);
    }
    
    return {
      deck,
      hand,
      tableau,
      foundations,
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
      return card.rank === 'K';
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

  static applyMove(state: GameState, action: MoveAction): { valid: boolean; state: GameState; error?: string } {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;

    if (action.type === 'draw') {
      if (newState.deck.length === 0) {
        return { valid: false, state, error: 'No cards left in deck' };
      }
      
      const card = newState.deck.pop()!;
      card.faceUp = true;
      newState.hand.push(card);
      newState.moves++;
      
      return { valid: true, state: newState };
    }

    if (action.type === 'move_card') {
      const { from, to, cardId } = action;
      if (!from || !to || !cardId) {
        return { valid: false, state, error: 'Invalid move parameters' };
      }

      let sourceCards: Card[];
      if (from.type === 'hand') {
        sourceCards = newState.hand;
      } else {
        sourceCards = newState.tableau[from.index];
      }

      const cardIndex = sourceCards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) {
        return { valid: false, state, error: 'Card not found' };
      }

      const card = sourceCards[cardIndex];

      let destPile: Card[];
      let isValidMove = false;

      if (to.type === 'foundation') {
        destPile = newState.foundations[to.index];
        const topCard = destPile[destPile.length - 1];
        isValidMove = this.isValidFoundationMove(card, topCard);
      } else {
        destPile = newState.tableau[to.index];
        const topCard = destPile[destPile.length - 1];
        isValidMove = this.isValidTableauMove(card, topCard);
      }

      if (!isValidMove) {
        return { valid: false, state, error: 'Invalid move' };
      }

      if (from.type === 'hand') {
        newState.hand.splice(cardIndex, 1);
        destPile.push(card);
      } else {
        const cardsToMove = sourceCards.splice(cardIndex);
        destPile.push(...cardsToMove);
      }

      newState.moves++;
      newState.score += 10;

      const isWon = newState.hand.length === 0 && 
                   newState.deck.length === 0 && 
                   newState.tableau.every(pile => pile.length === 0);
      
      if (isWon) {
        newState.isWon = true;
        newState.score += 100;
      }

      return { valid: true, state: newState };
    }

    return { valid: false, state, error: 'Unknown action type' };
  }
}
