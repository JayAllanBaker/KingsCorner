import { create } from 'zustand';
import { api } from '@/lib/api';
import type { GameState as ServerGameState, MoveAction, Player } from '@/types/game';
import { GameEngine } from '@/lib/game-engine';

interface MoveLocation {
  type: 'hand' | 'tableau' | 'foundation';
  index: number;
}

interface GameSettings {
  difficulty: 'easy' | 'standard' | 'hard';
  playerName: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

interface LocalGameState {
  gameId: string | null;
  matchId: string | null;
  state: ServerGameState | null;
  isGuestMode: boolean;
  isAITurnInProgress: boolean;
  localPlayerId: string;
  showMoveHints: boolean;
  turnHistory: ServerGameState[];
  settings: GameSettings;
  
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
  undoMove: () => void;
  canUndo: () => boolean;
  getLocalPlayerHand: () => import('@/types/game').Card[];
  toggleMoveHints: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loadSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem('kingsCornerSettings');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultSettings;
};

const defaultSettings: GameSettings = {
  difficulty: 'standard',
  playerName: 'Player',
  soundEnabled: true,
  hapticsEnabled: true,
};

export const useGameStore = create<LocalGameState>((set, get) => ({
  gameId: null,
  matchId: null,
  state: null,
  isGuestMode: false,
  isAITurnInProgress: false,
  localPlayerId: 'player',
  showMoveHints: true,
  turnHistory: [],
  settings: loadSettings(),
  
  isGameActive: false,
  isLoading: false,
  error: null,
  selectedCard: null,

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      try {
        localStorage.setItem('kingsCornerSettings', JSON.stringify(updated));
      } catch {}
      return { settings: updated };
    });
  },

  toggleMoveHints: () => {
    set((state) => ({ showMoveHints: !state.showMoveHints }));
  },

  canUndo: () => {
    const { turnHistory, isAITurnInProgress, state } = get();
    if (isAITurnInProgress || !state) return false;
    if (state.players[state.currentPlayerIndex].isAI) return false;
    return turnHistory.length > 0;
  },

  undoMove: () => {
    const { turnHistory, isAITurnInProgress, state } = get();
    if (isAITurnInProgress || !state) return;
    if (state.players[state.currentPlayerIndex].isAI) return;
    if (turnHistory.length === 0) return;
    
    const previousState = turnHistory[turnHistory.length - 1];
    const newHistory = turnHistory.slice(0, -1);
    set({ state: previousState, turnHistory: newHistory, selectedCard: null });
  },

  getLocalPlayerHand: () => {
    const { state, localPlayerId } = get();
    if (!state) return [];
    const localPlayer = state.players.find(p => p.id === localPlayerId);
    return localPlayer?.hand || [];
  },

  startSoloGame: async (difficulty?: 'EASY' | 'STANDARD' | 'HARD', isGuest = false) => {
    set({ isLoading: true, error: null });
    
    const { settings } = get();
    const difficultyToUse = difficulty || settings.difficulty.toUpperCase() as 'EASY' | 'STANDARD' | 'HARD';
    
    const gameState = GameEngine.initializeGame(undefined, 2);
    
    if (gameState.players[1]) {
      gameState.players[1].aiDifficulty = difficultyToUse;
      const difficultyNames = { EASY: 'Easy Bot', STANDARD: 'Bot', HARD: 'Master Bot' };
      gameState.players[1].name = difficultyNames[difficultyToUse];
    }
    
    set({
      gameId: `guest-${Date.now()}`,
      matchId: null,
      state: gameState,
      isGameActive: true,
      isLoading: false,
      isGuestMode: true,
      selectedCard: null,
      localPlayerId: 'player',
      turnHistory: [],
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
      selectedCard: null,
      turnHistory: [],
    });
  },

  reset: () => {
    const { settings } = get();
    const difficulty = settings.difficulty.toUpperCase() as 'EASY' | 'STANDARD' | 'HARD';
    
    const gameState = GameEngine.initializeGame(undefined, 2);
    
    if (gameState.players[1]) {
      gameState.players[1].aiDifficulty = difficulty;
      const difficultyNames = { EASY: 'Easy Bot', STANDARD: 'Bot', HARD: 'Master Bot' };
      gameState.players[1].name = difficultyNames[difficulty];
    }
    
    set({
      gameId: `guest-${Date.now()}`,
      state: gameState,
      isGameActive: true,
      error: null,
      selectedCard: null,
      isAITurnInProgress: false,
      turnHistory: [],
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
    const { state, isAITurnInProgress, turnHistory } = get();
    if (!state || isAITurnInProgress) return false;
    if (state.players[state.currentPlayerIndex].isAI) return false;

    console.log('moveCard called:', { source, destination, cardId });

    const action: MoveAction = {
      type: 'move_card',
      from: { type: source.type as 'hand' | 'tableau' | 'foundation', index: source.index },
      to: { type: destination.type as 'tableau' | 'foundation', index: destination.index },
      cardId,
    };

    const result = GameEngine.applyMove(state, action);
    console.log('applyMove result:', result.valid, result.error);
    if (result.valid) {
      const newHistory = [...turnHistory, JSON.parse(JSON.stringify(state))];
      set({ state: result.state, selectedCard: null, turnHistory: newHistory });
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
      set({ state: result.state, selectedCard: null, turnHistory: [] });
      
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
