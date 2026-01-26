import { create } from 'zustand';
import { api } from '@/lib/api';
import type { GameState as ServerGameState, MoveAction, Player } from '@/types/game';
import { GameEngine } from '@/lib/game-engine';

interface MoveLocation {
  type: 'hand' | 'tableau' | 'foundation';
  index: number;
}

interface LocalGameState {
  gameId: string | null;
  matchId: string | null;
  state: ServerGameState | null;
  isGuestMode: boolean;
  isAITurnInProgress: boolean;
  localPlayerId: string;
  showMoveHints: boolean;
  
  isGameActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  selectedCard: { cardId: string, location: MoveLocation } | null;

  startSoloGame: (difficulty?: 'EASY' | 'STANDARD' | 'HARD', isGuest?: boolean) => Promise<void>;
  startDailyChallenge: () => Promise<void>;
  drawCard: () => Promise<void>;
  selectCard: (cardId: string, location: MoveLocation) => void;
  moveCard: (source: MoveLocation, destination: MoveLocation, cardId: string) => Promise<boolean>;
  endTurn: () => Promise<void>;
  reset: () => void;
  getLocalPlayerHand: () => import('@/types/game').Card[];
  toggleMoveHints: () => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useGameStore = create<LocalGameState>((set, get) => ({
  gameId: null,
  matchId: null,
  state: null,
  isGuestMode: false,
  isAITurnInProgress: false,
  localPlayerId: 'player',
  showMoveHints: true,
  
  isGameActive: false,
  isLoading: false,
  error: null,
  selectedCard: null,

  toggleMoveHints: () => {
    set((state) => ({ showMoveHints: !state.showMoveHints }));
  },

  getLocalPlayerHand: () => {
    const { state, localPlayerId } = get();
    if (!state) return [];
    const localPlayer = state.players.find(p => p.id === localPlayerId);
    return localPlayer?.hand || [];
  },

  startSoloGame: async (difficulty = 'STANDARD', isGuest = false) => {
    set({ isLoading: true, error: null });
    
    const gameState = GameEngine.initializeGame(undefined, 2);
    set({
      gameId: `guest-${Date.now()}`,
      matchId: null,
      state: gameState,
      isGameActive: true,
      isLoading: false,
      isGuestMode: true,
      selectedCard: null,
      localPlayerId: 'player',
    });
  },

  startDailyChallenge: async () => {
    set({ isLoading: true, error: null });
    const today = new Date().toISOString().split('T')[0];
    const gameState = GameEngine.initializeGame(`daily-${today}`, 2);
    set({
      gameId: `daily-guest-${Date.now()}`,
      matchId: null,
      state: gameState,
      isGameActive: true,
      isLoading: false,
      isGuestMode: true,
      selectedCard: null
    });
  },

  reset: () => {
    const gameState = GameEngine.initializeGame(undefined, 2);
    set({
      gameId: `guest-${Date.now()}`,
      state: gameState,
      isGameActive: true,
      error: null,
      selectedCard: null,
      isAITurnInProgress: false,
    });
  },

  drawCard: async () => {
    const { state, isAITurnInProgress } = get();
    if (!state || state.deck.length === 0 || isAITurnInProgress) return;
    if (state.players[state.currentPlayerIndex].isAI) return;

    const action: MoveAction = { type: 'draw' };
    const result = GameEngine.applyMove(state, action);
    if (result.valid) {
      set({ state: result.state });
    }
  },

  selectCard: (cardId, location) => {
    const { isAITurnInProgress, state } = get();
    if (isAITurnInProgress) return;
    if (state && state.players[state.currentPlayerIndex].isAI) return;
    
    const current = get().selectedCard;
    if (current?.cardId === cardId) {
      set({ selectedCard: null });
      return;
    }
    set({ selectedCard: { cardId, location } });
  },

  moveCard: async (source, destination, cardId) => {
    const { state, isAITurnInProgress } = get();
    if (!state || isAITurnInProgress) return false;
    if (state.players[state.currentPlayerIndex].isAI) return false;

    const action: MoveAction = {
      type: 'move_card',
      from: { type: source.type as 'hand' | 'tableau', index: source.index },
      to: { type: destination.type as 'tableau' | 'foundation', index: destination.index },
      cardId,
    };

    const result = GameEngine.applyMove(state, action);
    if (result.valid) {
      set({ state: result.state, selectedCard: null });
      return true;
    }
    return false;
  },

  endTurn: async () => {
    const { state, isAITurnInProgress } = get();
    if (!state || isAITurnInProgress) return;
    if (state.players[state.currentPlayerIndex].isAI) return;
    if (state.winner) return;

    const action: MoveAction = { type: 'end_turn' };
    const result = GameEngine.applyMove(state, action);
    if (result.valid) {
      set({ state: result.state, selectedCard: null });
      
      const runAITurns = async () => {
        let currentState = result.state;
        
        while (currentState.players[currentState.currentPlayerIndex].isAI && !currentState.winner) {
          set({ isAITurnInProgress: true });
          await delay(800);
          
          let aiMadeMove = true;
          while (aiMadeMove && !currentState.winner) {
            const aiMove = GameEngine.getAIMove(currentState);
            if (aiMove && aiMove.type === 'move_card') {
              const aiResult = GameEngine.applyMove(currentState, aiMove);
              if (aiResult.valid) {
                currentState = aiResult.state;
                set({ state: currentState });
                await delay(600);
              } else {
                aiMadeMove = false;
              }
            } else {
              aiMadeMove = false;
            }
          }
          
          if (!currentState.winner) {
            const endResult = GameEngine.applyMove(currentState, { type: 'end_turn' });
            if (endResult.valid) {
              currentState = endResult.state;
              set({ state: currentState });
            }
          }
        }
        
        set({ isAITurnInProgress: false });
      };
      
      if (result.state.players[result.state.currentPlayerIndex].isAI) {
        runAITurns();
      }
    }
  },
}));
