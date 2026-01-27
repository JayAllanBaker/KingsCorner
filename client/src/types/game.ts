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

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  hand: Card[];
  score: number;
  aiDifficulty?: 'EASY' | 'STANDARD' | 'HARD';
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
  
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  turnPhase: 'playing' | 'drawing' | 'ended';
  winner: string | null;
}

export interface MoveAction {
  type: 'draw' | 'move_card' | 'end_turn';
  from?: { type: 'hand' | 'tableau' | 'foundation', index: number };
  to?: { type: 'tableau' | 'foundation', index: number };
  cardId?: string;
}
