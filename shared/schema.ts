import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models
export * from "./models/auth";

// User Profiles (extends auth users table)
export const profiles = pgTable("profiles", {
  userId: varchar("user_id").primaryKey().references(() => require("./models/auth").users.id),
  displayName: text("display_name"),
  avatarId: integer("avatar_id").default(0),
  rating: integer("rating").default(1200).notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  winStreak: integer("win_streak").default(0).notNull(),
  bestTimeSeconds: integer("best_time_seconds"),
  gamesPlayed: integer("games_played").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Match History
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mode: varchar("mode", { length: 20 }).notNull(), // 'AI', 'RANKED', 'FRIEND', 'DAILY'
  status: varchar("status", { length: 20 }).default('ACTIVE').notNull(), // 'ACTIVE', 'COMPLETE', 'ABANDONED'
  player1Id: varchar("player1_id").references(() => require("./models/auth").users.id),
  player2Id: varchar("player2_id").references(() => require("./models/auth").users.id),
  winnerId: varchar("winner_id").references(() => require("./models/auth").users.id),
  seed: text("seed"), // For reproducible games
  difficulty: varchar("difficulty", { length: 20 }), // 'EASY', 'STANDARD', 'HARD' for AI
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  finalState: jsonb("final_state"), // Complete game state snapshot
  moveHistory: jsonb("move_history"), // Array of moves
  player1Score: integer("player1_score").default(0),
  player2Score: integer("player2_score").default(0),
  totalMoves: integer("total_moves").default(0),
  durationSeconds: integer("duration_seconds"),
}, (table) => [
  index("matches_player1_idx").on(table.player1Id),
  index("matches_player2_idx").on(table.player2Id),
  index("matches_mode_idx").on(table.mode),
]);

// Daily Challenge
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).unique().notNull(), // YYYY-MM-DD
  seed: text("seed").notNull(),
  rulesConfig: jsonb("rules_config"), // For future rule toggles
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Challenge Scores
export const dailyChallengeScores = pgTable("daily_challenge_scores", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => dailyChallenges.id).notNull(),
  userId: varchar("user_id").references(() => require("./models/auth").users.id).notNull(),
  score: integer("score").notNull(),
  moves: integer("moves").notNull(),
  timeSeconds: integer("time_seconds").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("daily_scores_challenge_idx").on(table.challengeId),
  index("daily_scores_user_idx").on(table.userId),
]);

// Active Games (for real-time multiplayer sessions)
export const activeGames = pgTable("active_games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id).notNull(),
  currentState: jsonb("current_state").notNull(), // Full game state
  currentTurn: varchar("current_turn"), // userId whose turn it is
  lobbyCode: varchar("lobby_code", { length: 6 }).unique(), // For friend matches
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("active_games_lobby_code_idx").on(table.lobbyCode),
  index("active_games_match_id_idx").on(table.matchId),
]);

// Schema types
export const insertProfileSchema = createInsertSchema(profiles).omit({ userId: true, createdAt: true, updatedAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, startedAt: true, endedAt: true });
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({ id: true, createdAt: true });
export const insertDailyChallengeScoreSchema = createInsertSchema(dailyChallengeScores).omit({ id: true, createdAt: true, completedAt: true });
export const insertActiveGameSchema = createInsertSchema(activeGames).omit({ id: true, createdAt: true, updatedAt: true });

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;

export type DailyChallengeScore = typeof dailyChallengeScores.$inferSelect;
export type InsertDailyChallengeScore = z.infer<typeof insertDailyChallengeScoreSchema>;

export type ActiveGame = typeof activeGames.$inferSelect;
export type InsertActiveGame = z.infer<typeof insertActiveGameSchema>;
