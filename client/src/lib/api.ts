import type { GameState, MoveAction } from '../types/game';

export interface Profile {
  userId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  eloRating: number;
}

export interface Match {
  id: string;
  mode: 'AI' | 'PVP' | 'DAILY';
  status: 'ACTIVE' | 'COMPLETE' | 'ABANDONED';
  player1Id: string;
  player2Id?: string | null;
  difficulty?: string | null;
  winnerId?: string | null;
  player1Score?: number | null;
  player2Score?: number | null;
  totalMoves?: number | null;
  startedAt: Date;
  endedAt?: Date | null;
}

export interface DailyChallenge {
  id: number;
  date: string;
  seed: string;
}

export interface DailyChallengeScore {
  challengeId: number;
  userId: string;
  score: number;
  timeSeconds: number;
  completed: boolean;
}

class API {
  private baseURL = '/api';

  async getProfile(): Promise<Profile> {
    const res = await fetch(`${this.baseURL}/profile`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const res = await fetch(`${this.baseURL}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  async startSoloGame(difficulty: 'EASY' | 'STANDARD' | 'HARD' = 'STANDARD'): Promise<{
    gameId: string;
    matchId: string;
    state: GameState;
  }> {
    const res = await fetch(`${this.baseURL}/game/solo/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ difficulty }),
    });
    if (!res.ok) throw new Error('Failed to start solo game');
    return res.json();
  }

  async makeMove(gameId: string, action: MoveAction): Promise<{
    state: GameState;
    aiMove: MoveAction | null;
  }> {
    const res = await fetch(`${this.baseURL}/game/solo/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to make move');
    }
    return res.json();
  }

  async getDailyChallenge(): Promise<{
    challenge: DailyChallenge;
    userScore: DailyChallengeScore | null;
    leaderboard: DailyChallengeScore[];
  }> {
    const res = await fetch(`${this.baseURL}/daily-challenge`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch daily challenge');
    return res.json();
  }

  async startDailyChallenge(): Promise<{
    gameId: string;
    matchId: string;
    state: GameState;
    challengeId: number;
  }> {
    const res = await fetch(`${this.baseURL}/daily-challenge/start`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to start daily challenge');
    return res.json();
  }

  async getMatchHistory(): Promise<Match[]> {
    const res = await fetch(`${this.baseURL}/matches/history`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch match history');
    return res.json();
  }
}

export const api = new API();
