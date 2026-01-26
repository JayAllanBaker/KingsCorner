import { GameEngine, type GameState, type MoveAction, type Card, RANK_VALUE } from './engine';

export type AIDifficulty = 'EASY' | 'STANDARD' | 'HARD';

interface ScoredMove {
  action: MoveAction;
  score: number;
}

export class AIOpponent {
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'STANDARD') {
    this.difficulty = difficulty;
  }

  /**
   * Generate the next move for the AI
   */
  async selectMove(state: GameState): Promise<MoveAction | null> {
    const possibleMoves = this.generatePossibleMoves(state);
    
    if (possibleMoves.length === 0) {
      // If no valid moves, draw a card if possible
      if (state.deck.length > 0) {
        return { type: 'draw' };
      }
      return null; // No moves available
    }

    // Score moves based on difficulty
    const scoredMoves = possibleMoves.map(move => ({
      action: move,
      score: this.scoreMove(state, move)
    }));

    // Select move based on difficulty
    let selectedMove: MoveAction;

    switch (this.difficulty) {
      case 'EASY':
        // Pick randomly, slightly weighted toward better moves
        selectedMove = this.selectEasy(scoredMoves);
        break;
      
      case 'STANDARD':
        // Pick the best move with some randomness
        selectedMove = this.selectStandard(scoredMoves);
        break;
      
      case 'HARD':
        // Always pick the best move
        selectedMove = this.selectHard(scoredMoves);
        break;
      
      default:
        selectedMove = this.selectStandard(scoredMoves);
    }

    return selectedMove;
  }

  private generatePossibleMoves(state: GameState): MoveAction[] {
    const moves: MoveAction[] = [];

    // Try moving cards from hand
    for (let i = 0; i < state.hand.length; i++) {
      const card = state.hand[i];
      
      // Try foundations
      for (let f = 0; f < 4; f++) {
        const topCard = state.foundations[f].length > 0 
          ? state.foundations[f][state.foundations[f].length - 1] 
          : undefined;
        
        if (GameEngine.isValidFoundationMove(card, topCard)) {
          moves.push({
            type: 'move_card',
            from: { type: 'hand', index: 0 },
            to: { type: 'foundation', index: f },
            cardId: card.id
          });
        }
      }

      // Try tableau
      for (let t = 0; t < 4; t++) {
        const topCard = state.tableau[t].length > 0 
          ? state.tableau[t][state.tableau[t].length - 1] 
          : undefined;
        
        if (GameEngine.isValidTableauMove(card, topCard)) {
          moves.push({
            type: 'move_card',
            from: { type: 'hand', index: 0 },
            to: { type: 'tableau', index: t },
            cardId: card.id
          });
        }
      }
    }

    // Try moving cards from tableau
    for (let fromT = 0; fromT < 4; fromT++) {
      const fromPile = state.tableau[fromT];
      if (fromPile.length === 0) continue;

      // Try moving sequences
      for (let startIdx = 0; startIdx < fromPile.length; startIdx++) {
        const sequence = fromPile.slice(startIdx);
        const topCard = sequence[0];

        // Try foundations (only if single card)
        if (sequence.length === 1) {
          for (let f = 0; f < 4; f++) {
            const destTopCard = state.foundations[f].length > 0 
              ? state.foundations[f][state.foundations[f].length - 1] 
              : undefined;
            
            if (GameEngine.isValidFoundationMove(topCard, destTopCard)) {
              moves.push({
                type: 'move_card',
                from: { type: 'tableau', index: fromT },
                to: { type: 'foundation', index: f },
                cardId: topCard.id
              });
            }
          }
        }

        // Try other tableau piles
        for (let toT = 0; toT < 4; toT++) {
          if (toT === fromT) continue;

          const toPile = state.tableau[toT];
          const destTopCard = toPile.length > 0 ? toPile[toPile.length - 1] : undefined;

          if (GameEngine.isValidTableauMove(topCard, destTopCard) && GameEngine.isValidSequence(sequence)) {
            moves.push({
              type: 'move_card',
              from: { type: 'tableau', index: fromT },
              to: { type: 'tableau', index: toT },
              cardId: topCard.id
            });
          }
        }
      }
    }

    return moves;
  }

  private scoreMove(state: GameState, move: MoveAction): number {
    let score = 0;

    if (move.type === 'draw') {
      return -5; // Drawing is less preferred than making a move
    }

    if (move.type === 'move_card' && move.to) {
      // Prioritize foundation moves (goal is to clear hand)
      if (move.to.type === 'foundation') {
        score += 100;
      }

      // Prioritize moves from hand (clear hand is win condition)
      if (move.from?.type === 'hand') {
        score += 50;
      }

      // Prefer moves that expose new cards or create empty tableau spaces
      if (move.from?.type === 'tableau') {
        const fromPile = state.tableau[move.from.index];
        const cardIndex = fromPile.findIndex(c => c.id === move.cardId);
        
        // Moving the only card creates an empty space (valuable for Kings)
        if (cardIndex === 0 && fromPile.length === 1) {
          score += 20;
        }
      }

      // Bonus for completing sequences
      if (move.cardId) {
        const card = this.findCard(state, move.cardId);
        if (card && RANK_VALUE[card.rank] === 1) { // Ace to foundation
          score += 10;
        }
      }
    }

    return score;
  }

  private findCard(state: GameState, cardId: string): Card | undefined {
    // Search hand
    const handCard = state.hand.find(c => c.id === cardId);
    if (handCard) return handCard;

    // Search tableau
    for (const pile of state.tableau) {
      const tableauCard = pile.find(c => c.id === cardId);
      if (tableauCard) return tableauCard;
    }

    return undefined;
  }

  private selectEasy(scoredMoves: ScoredMove[]): MoveAction {
    // Pick randomly with slight bias toward higher scores
    const weights = scoredMoves.map(m => Math.max(1, m.score + 10));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < scoredMoves.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return scoredMoves[i].action;
      }
    }

    return scoredMoves[scoredMoves.length - 1].action;
  }

  private selectStandard(scoredMoves: ScoredMove[]): MoveAction {
    // Pick from top 50% of moves with randomness
    scoredMoves.sort((a, b) => b.score - a.score);
    const topHalf = scoredMoves.slice(0, Math.max(1, Math.ceil(scoredMoves.length / 2)));
    return topHalf[Math.floor(Math.random() * topHalf.length)].action;
  }

  private selectHard(scoredMoves: ScoredMove[]): MoveAction {
    // Always pick the highest scoring move
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].action;
  }
}
