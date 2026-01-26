import { create } from 'zustand';
import { api } from '@/lib/api';
import type { GameState as ServerGameState, MoveAction } from '@/types/game';

interface MoveLocation {
  type: 'hand' | 'tableau' | 'foundation';
  index: number;
}

interface LocalGameState {
  gameId: string | null;
  matchId: string | null;
  state: ServerGameState | null;
  
  isGameActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  selectedCard: { cardId: string, location: MoveLocation } | null;

  // Actions
  startSoloGame: (difficulty?: 'EASY' | 'STANDARD' | 'HARD') => Promise<void>;
  startDailyChallenge: () => Promise<void>;
  drawCard: () => Promise<void>;
  selectCard: (cardId: string, location: MoveLocation) => void;
  moveCard: (source: MoveLocation, destination: MoveLocation, cardId: string) => Promise<boolean>;
  reset: () => void;
}

export const useGameStore = create<LocalGameState>((set, get) => ({
  gameId: null,
  matchId: null,
  state: null,
  
  isGameActive: false,
  isLoading: false,
  error: null,
  selectedCard: null,

  startSoloGame: async (difficulty = 'STANDARD') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.startSoloGame(difficulty);
      set({
        gameId: response.gameId,
        matchId: response.matchId,
        state: response.state,
        isGameActive: true,
        isLoading: false,
        selectedCard: null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start game',
        isLoading: false 
      });
    }
  },

  startDailyChallenge: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.startDailyChallenge();
      set({
        gameId: response.gameId,
        matchId: response.matchId,
        state: response.state,
        isGameActive: true,
        isLoading: false,
        selectedCard: null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start daily challenge',
        isLoading: false 
      });
    }
  },

  reset: () => {
    set({
      gameId: null,
      matchId: null,
      state: null,
      isGameActive: false,
      error: null,
      selectedCard: null
    });
  },

  drawCard: async () => {
    const { gameId, isGameActive, state } = get();
    if (!gameId || !isGameActive || !state || state.deck.length === 0) return;

    set({ isLoading: true, error: null });
    
    const action: MoveAction = { type: 'draw' };
    
    try {
      const response = await api.makeMove(gameId, action);
      set({
        state: response.state,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to draw card',
        isLoading: false 
      });
    }
  },

  selectCard: (cardId, location) => {
    const current = get().selectedCard;
    if (current?.cardId === cardId) {
      set({ selectedCard: null });
      return;
    }
    set({ selectedCard: { cardId, location } });
  },

  moveCard: async (source, destination, cardId) => {
    const { gameId, isGameActive } = get();
    if (!gameId || !isGameActive) return false;

    set({ isLoading: true, error: null });
    
    const action: MoveAction = {
      type: 'move_card',
      from: { type: source.type, index: source.index },
      to: { type: destination.type, index: destination.index },
      cardId,
    };
    
    try {
      const response = await api.makeMove(gameId, action);
      set({
        state: response.state,
        selectedCard: null,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Invalid move',
        isLoading: false 
      });
      return false;
    }
  },
}));
