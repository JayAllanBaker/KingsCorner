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

  static initializeGame(seed?: string, numPlayers: number = 2): GameState {
    const deck = this.createDeck(seed);
    
    const tableau: Card[][] = [[], [], [], []];
    const foundations: Card[][] = [[], [], [], []];
    
    for (let i = 0; i < 4; i++) {
      const card = deck.pop()!;
      card.faceUp = true;
      tableau[i].push(card);
    }
    
    const players: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      const hand: Card[] = [];
      for (let j = 0; j < 7; j++) {
        const card = deck.pop()!;
        card.faceUp = true;
        hand.push(card);
      }
      players.push({
        id: i === 0 ? 'player' : `ai-${i}`,
        name: i === 0 ? 'You' : `Bot ${i}`,
        isAI: i !== 0,
        hand,
        score: 0,
      });
    }
    
    return {
      deck,
      hand: players[0].hand,
      tableau,
      foundations,
      score: 0,
      moves: 0,
      isWon: false,
      seed,
      players,
      currentPlayerIndex: 0,
      round: 1,
      turnPhase: 'playing',
      winner: null,
    };
  }

  static getCurrentPlayer(state: GameState): Player {
    return state.players[state.currentPlayerIndex];
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

  static checkWinner(state: GameState): string | null {
    for (const player of state.players) {
      if (player.hand.length === 0) {
        return player.id;
      }
    }
    return null;
  }

  static applyMove(state: GameState, action: MoveAction): { valid: boolean; state: GameState; error?: string } {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    const currentPlayer = newState.players[newState.currentPlayerIndex];

    if (action.type === 'end_turn') {
      if (newState.turnPhase === 'playing') {
        newState.turnPhase = 'drawing';
        if (newState.deck.length > 0) {
          const card = newState.deck.pop()!;
          card.faceUp = true;
          currentPlayer.hand.push(card);
        }
      }
      
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      if (newState.currentPlayerIndex === 0) {
        newState.round++;
      }
      newState.turnPhase = 'playing';
      newState.hand = newState.players[newState.currentPlayerIndex].hand;
      
      const winner = this.checkWinner(newState);
      if (winner) {
        newState.winner = winner;
        newState.isWon = true;
      }
      
      return { valid: true, state: newState };
    }

    if (action.type === 'draw') {
      if (newState.deck.length === 0) {
        return { valid: false, state, error: 'No cards left in deck' };
      }
      
      const card = newState.deck.pop()!;
      card.faceUp = true;
      currentPlayer.hand.push(card);
      newState.hand = currentPlayer.hand;
      newState.moves++;
      
      return { valid: true, state: newState };
    }

    if (action.type === 'move_card') {
      const { from, to, cardId } = action;
      if (!from || !to || !cardId) {
        return { valid: false, state, error: 'Invalid move parameters' };
      }

      // Can only move TO tableau or foundation, not hand
      if (to.type !== 'tableau' && to.type !== 'foundation') {
        return { valid: false, state, error: 'Invalid destination' };
      }

      let sourceCards: Card[];
      if (from.type === 'hand') {
        sourceCards = currentPlayer.hand;
      } else if (from.type === 'tableau') {
        sourceCards = newState.tableau[from.index];
      } else {
        sourceCards = newState.foundations[from.index];
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
        console.log('Foundation move check:', card.rank, card.suit, '->', topCard?.rank, topCard?.suit, 'valid:', isValidMove);
      } else {
        destPile = newState.tableau[to.index];
        const topCard = destPile[destPile.length - 1];
        isValidMove = this.isValidTableauMove(card, topCard);
        console.log('Tableau move check:', card.rank, card.suit, '->', topCard?.rank, topCard?.suit, 'valid:', isValidMove);
      }

      if (!isValidMove) {
        return { valid: false, state, error: 'Invalid move' };
      }

      if (from.type === 'hand') {
        currentPlayer.hand.splice(cardIndex, 1);
        destPile.push(card);
      } else {
        const cardsToMove = sourceCards.splice(cardIndex);
        destPile.push(...cardsToMove);
      }

      newState.hand = currentPlayer.hand;
      newState.moves++;
      currentPlayer.score += 10;
      newState.score = currentPlayer.score;

      const winner = this.checkWinner(newState);
      if (winner) {
        newState.winner = winner;
        newState.isWon = true;
      }

      return { valid: true, state: newState };
    }

    return { valid: false, state, error: 'Unknown action type' };
  }

  static getAIMove(state: GameState): MoveAction | null {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const difficulty = currentPlayer.aiDifficulty || 'STANDARD';
    
    const allMoves: MoveAction[] = [];
    
    for (const card of currentPlayer.hand) {
      for (let i = 0; i < 4; i++) {
        const foundationPile = state.foundations[i];
        const topCard = foundationPile[foundationPile.length - 1];
        if (this.isValidFoundationMove(card, topCard)) {
          allMoves.push({
            type: 'move_card',
            from: { type: 'hand', index: 0 },
            to: { type: 'foundation', index: i },
            cardId: card.id,
          });
        }
      }
    }
    
    for (const card of currentPlayer.hand) {
      for (let i = 0; i < 4; i++) {
        const tableauPile = state.tableau[i];
        const topCard = tableauPile[tableauPile.length - 1];
        if (this.isValidTableauMove(card, topCard)) {
          allMoves.push({
            type: 'move_card',
            from: { type: 'hand', index: 0 },
            to: { type: 'tableau', index: i },
            cardId: card.id,
          });
        }
      }
    }
    
    if (allMoves.length === 0) {
      return { type: 'end_turn' };
    }
    
    if (difficulty === 'EASY') {
      if (Math.random() < 0.4) {
        return { type: 'end_turn' };
      }
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
    
    if (difficulty === 'HARD') {
      const foundationMoves = allMoves.filter(m => m.to?.type === 'foundation');
      if (foundationMoves.length > 0) {
        return foundationMoves[0];
      }
      const kingMoves = allMoves.filter(m => {
        const card = currentPlayer.hand.find(c => c.id === m.cardId);
        return card?.rank === 'K';
      });
      if (kingMoves.length > 0) {
        return kingMoves[0];
      }
      return allMoves[0];
    }
    
    return allMoves[0];
  }
}
