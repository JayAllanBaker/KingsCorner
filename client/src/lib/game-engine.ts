
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

export type PileType = 'tableau' | 'foundation' | 'waste' | 'hand';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RANK_VALUE: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export class GameEngine {
  static createDeck(): Card[] {
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
    return this.shuffle(deck);
  }

  static shuffle(deck: Card[]): Card[] {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }

  // Rules:
  // Foundation: Build DOWN in suit (K -> A)
  static isValidFoundationMove(card: Card, topCard?: Card): boolean {
    if (!topCard) {
      // Empty foundation requires King
      return card.rank === 'K';
    }
    // Must be same suit
    if (card.suit !== topCard.suit) return false;
    
    // Must be one rank lower (e.g., Q on K)
    const cardValue = RANK_VALUE[card.rank];
    const topValue = RANK_VALUE[topCard.rank];
    return topValue - cardValue === 1;
  }

  // Rules:
  // Tableau: Build DOWN in alternating color
  // Empty Tableau: King only
  static isValidTableauMove(card: Card, topCard?: Card): boolean {
    if (!topCard) {
      // Empty tableau requires King
      return card.rank === 'K';
    }
    
    // Must be alternating color
    if (card.color === topCard.color) return false;

    // Must be one rank lower
    const cardValue = RANK_VALUE[card.rank];
    const topValue = RANK_VALUE[topCard.rank];
    return topValue - cardValue === 1;
  }
  
  // Check if a sequence of cards can be moved (e.g. moving a stack between tableau columns)
  // In Kings Corner, you can move "valid descending alternating color sequences"
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
}
