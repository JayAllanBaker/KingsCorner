import { 
  profiles, matches, dailyChallenges, dailyChallengeScores, activeGames,
  type Profile, type InsertProfile,
  type Match, type InsertMatch,
  type DailyChallenge, type InsertDailyChallenge,
  type DailyChallengeScore, type InsertDailyChallengeScore,
  type ActiveGame, type InsertActiveGame
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Profile methods
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile>;
  updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile>;
  
  // Match methods
  createMatch(data: InsertMatch): Promise<Match>;
  getMatch(id: string): Promise<Match | undefined>;
  updateMatch(id: string, data: Partial<Match>): Promise<Match>;
  getMatchHistory(userId: string, limit?: number): Promise<Match[]>;
  
  // Active game methods
  createActiveGame(data: InsertActiveGame): Promise<ActiveGame>;
  getActiveGame(id: string): Promise<ActiveGame | undefined>;
  getActiveGameByLobbyCode(code: string): Promise<ActiveGame | undefined>;
  updateActiveGame(id: string, data: Partial<ActiveGame>): Promise<ActiveGame>;
  deleteActiveGame(id: string): Promise<void>;
  
  // Daily challenge methods
  getDailyChallenge(date: string): Promise<DailyChallenge | undefined>;
  createDailyChallenge(data: InsertDailyChallenge): Promise<DailyChallenge>;
  getDailyChallengeScore(challengeId: number, userId: string): Promise<DailyChallengeScore | undefined>;
  createDailyChallengeScore(data: InsertDailyChallengeScore): Promise<DailyChallengeScore>;
  getDailyChallengeLeaderboard(challengeId: number, limit?: number): Promise<DailyChallengeScore[]>;
}

export class DatabaseStorage implements IStorage {
  // Profile methods
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
  }

  async createProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values({ userId, ...data })
      .returning();
    return profile;
  }

  async updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  // Match methods
  async createMatch(data: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values(data)
      .returning();
    return match;
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<Match> {
    const [match] = await db
      .update(matches)
      .set(data)
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async getMatchHistory(userId: string, limit: number = 20): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(sql`${matches.player1Id} = ${userId} OR ${matches.player2Id} = ${userId}`)
      .orderBy(desc(matches.startedAt))
      .limit(limit);
  }

  // Active game methods
  async createActiveGame(data: InsertActiveGame): Promise<ActiveGame> {
    const [game] = await db
      .insert(activeGames)
      .values(data)
      .returning();
    return game;
  }

  async getActiveGame(id: string): Promise<ActiveGame | undefined> {
    const [game] = await db.select().from(activeGames).where(eq(activeGames.id, id));
    return game || undefined;
  }

  async getActiveGameByLobbyCode(code: string): Promise<ActiveGame | undefined> {
    const [game] = await db.select().from(activeGames).where(eq(activeGames.lobbyCode, code));
    return game || undefined;
  }

  async updateActiveGame(id: string, data: Partial<ActiveGame>): Promise<ActiveGame> {
    const [game] = await db
      .update(activeGames)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(activeGames.id, id))
      .returning();
    return game;
  }

  async deleteActiveGame(id: string): Promise<void> {
    await db.delete(activeGames).where(eq(activeGames.id, id));
  }

  // Daily challenge methods
  async getDailyChallenge(date: string): Promise<DailyChallenge | undefined> {
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, date));
    return challenge || undefined;
  }

  async createDailyChallenge(data: InsertDailyChallenge): Promise<DailyChallenge> {
    const [challenge] = await db
      .insert(dailyChallenges)
      .values(data)
      .returning();
    return challenge;
  }

  async getDailyChallengeScore(challengeId: number, userId: string): Promise<DailyChallengeScore | undefined> {
    const [score] = await db
      .select()
      .from(dailyChallengeScores)
      .where(and(
        eq(dailyChallengeScores.challengeId, challengeId),
        eq(dailyChallengeScores.userId, userId)
      ));
    return score || undefined;
  }

  async createDailyChallengeScore(data: InsertDailyChallengeScore): Promise<DailyChallengeScore> {
    const [score] = await db
      .insert(dailyChallengeScores)
      .values(data)
      .returning();
    return score;
  }

  async getDailyChallengeLeaderboard(challengeId: number, limit: number = 100): Promise<DailyChallengeScore[]> {
    return await db
      .select()
      .from(dailyChallengeScores)
      .where(and(
        eq(dailyChallengeScores.challengeId, challengeId),
        eq(dailyChallengeScores.completed, true)
      ))
      .orderBy(desc(dailyChallengeScores.score), dailyChallengeScores.timeSeconds)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
