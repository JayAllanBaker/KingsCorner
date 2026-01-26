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
