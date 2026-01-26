import { create } from 'zustand';
import { api } from '@/lib/api';
import type { GameState as ServerGameState, MoveAction } from '@/types/game';
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
  
  isGameActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  selectedCard: { cardId: string, location: MoveLocation } | null;

  startSoloGame: (difficulty?: 'EASY' | 'STANDARD' | 'HARD', isGuest?: boolean) => Promise<void>;
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
  isGuestMode: false,
  
  isGameActive: false,
  isLoading: false,
  error: null,
  selectedCard: null,

  startSoloGame: async (difficulty = 'STANDARD', isGuest = false) => {
    set({ isLoading: true, error: null });
    
    if (isGuest) {
      const gameState = GameEngine.initializeGame();
      set({
        gameId: `guest-${Date.now()}`,
        matchId: null,
        state: gameState,
        isGameActive: true,
        isLoading: false,
        isGuestMode: true,
        selectedCard: null
      });
      return;
    }
    
    try {
      const response = await api.startSoloGame(difficulty);
      set({
        gameId: response.gameId,
        matchId: response.matchId,
        state: response.state,
        isGameActive: true,
        isLoading: false,
        isGuestMode: false,
        selectedCard: null
      });
    } catch (error) {
      const gameState = GameEngine.initializeGame();
      set({
        gameId: `guest-${Date.now()}`,
        matchId: null,
        state: gameState,
        isGameActive: true,
        isLoading: false,
        isGuestMode: true,
        selectedCard: null
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
        isGuestMode: false,
        selectedCard: null
      });
    } catch (error) {
      const today = new Date().toISOString().split('T')[0];
      const gameState = GameEngine.initializeGame(`daily-${today}`);
      set({
        gameId: `daily-guest-${Date.now()}`,
        matchId: null,
        state: gameState,
        isGameActive: true,
        isLoading: false,
        isGuestMode: true,
        selectedCard: null
      });
    }
  },

  reset: () => {
    const { isGuestMode } = get();
    if (isGuestMode) {
      const gameState = GameEngine.initializeGame();
      set({
        gameId: `guest-${Date.now()}`,
        state: gameState,
        isGameActive: true,
        error: null,
        selectedCard: null
      });
    } else {
      set({
        gameId: null,
        matchId: null,
        state: null,
        isGameActive: false,
        error: null,
        selectedCard: null
      });
    }
  },

  drawCard: async () => {
    const { gameId, isGameActive, state, isGuestMode } = get();
    if (!gameId || !isGameActive || !state || state.deck.length === 0) return;

    if (isGuestMode) {
      const action: MoveAction = { type: 'draw' };
      const result = GameEngine.applyMove(state, action);
      if (result.valid) {
        set({ state: result.state });
      }
      return;
    }

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
    const { gameId, isGameActive, state, isGuestMode } = get();
    if (!gameId || !isGameActive || !state) return false;

    const action: MoveAction = {
      type: 'move_card',
      from: { type: source.type as 'hand' | 'tableau', index: source.index },
      to: { type: destination.type as 'tableau' | 'foundation', index: destination.index },
      cardId,
    };

    if (isGuestMode) {
      const result = GameEngine.applyMove(state, action);
      if (result.valid) {
        set({ state: result.state, selectedCard: null });
        return true;
      }
      return false;
    }

    set({ isLoading: true, error: null });
    
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
