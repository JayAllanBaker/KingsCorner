import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { setupWebSocket } from "./websocket";
import { storage } from "./storage";
import { GameEngine, type GameState, type MoveAction } from "./game/engine";
import { AIOpponent, type AIDifficulty } from "./game/ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth (must be before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup WebSocket for real-time multiplayer
  await setupWebSocket(httpServer);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ============ Profile Routes ============
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let profile = await storage.getProfile(userId);
      
      if (!profile) {
        // Create profile on first access
        profile = await storage.createProfile(userId, {});
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // ============ Solo Game Routes (vs AI) ============
  app.post("/api/game/solo/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { difficulty = 'STANDARD' } = req.body as { difficulty?: AIDifficulty };

      // Initialize game state
      const gameState = GameEngine.initializeGame();

      // Create match record
      const match = await storage.createMatch({
        mode: 'AI',
        status: 'ACTIVE',
        player1Id: userId,
        difficulty,
        seed: gameState.seed,
        finalState: gameState as any,
        moveHistory: [] as any,
      });

      // Create active game
      const activeGame = await storage.createActiveGame({
        matchId: match.id,
        currentState: gameState as any,
        currentTurn: userId,
      });

      res.json({
        gameId: activeGame.id,
        matchId: match.id,
        state: gameState,
      });
    } catch (error) {
      console.error("Error starting solo game:", error);
      res.status(500).json({ message: "Failed to start game" });
    }
  });

  app.post("/api/game/solo/:gameId/move", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameId } = req.params;
      const { action } = req.body as { action: MoveAction };

      // Get active game
      const activeGame = await storage.getActiveGame(gameId);
      if (!activeGame) {
        return res.status(404).json({ message: "Game not found" });
      }

      const currentState = activeGame.currentState as GameState;

      // Apply player move
      const result = GameEngine.applyMove(currentState, action);
      if (!result.valid) {
        return res.status(400).json({ message: result.error || "Invalid move" });
      }

      let finalState = result.state;
      let aiMove = null;

      // If game not won, let AI play
      if (!finalState.isWon && finalState.deck.length > 0) {
        // Get match to determine difficulty
        const match = await storage.getMatch(activeGame.matchId);
        const difficulty = (match?.difficulty as AIDifficulty) || 'STANDARD';
        
        const ai = new AIOpponent(difficulty);
        const aiAction = await ai.selectMove(finalState);
        
        if (aiAction) {
          const aiResult = GameEngine.applyMove(finalState, aiAction);
          if (aiResult.valid) {
            finalState = aiResult.state;
            aiMove = aiAction;
          }
        }
      }

      // Update active game
      await storage.updateActiveGame(gameId, {
        currentState: finalState as any,
      });

      // If game is won, finalize match
      if (finalState.isWon) {
        await storage.updateMatch(activeGame.matchId, {
          status: 'COMPLETE',
          endedAt: new Date(),
          finalState: finalState as any,
          player1Score: finalState.score,
          totalMoves: finalState.moves,
          winnerId: userId,
        });

        // Update player profile
        const profile = await storage.getProfile(userId);
        if (profile) {
          await storage.updateProfile(userId, {
            wins: profile.wins + 1,
            winStreak: profile.winStreak + 1,
            gamesPlayed: profile.gamesPlayed + 1,
          });
        }
      }

      res.json({
        state: finalState,
        aiMove,
      });
    } catch (error) {
      console.error("Error making move:", error);
      res.status(500).json({ message: "Failed to make move" });
    }
  });

  // ============ Daily Challenge Routes ============
  app.get("/api/daily-challenge", isAuthenticated, async (req: any, res) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      let challenge = await storage.getDailyChallenge(today);
      
      if (!challenge) {
        // Generate new daily challenge with seeded random
        const seed = `daily-${today}`;
        challenge = await storage.createDailyChallenge({
          date: today,
          seed,
          rulesConfig: {} as any,
        });
      }

      // Get user's score for this challenge if exists
      const userId = req.user.claims.sub;
      const userScore = await storage.getDailyChallengeScore(challenge.id, userId);

      // Get leaderboard
      const leaderboard = await storage.getDailyChallengeLeaderboard(challenge.id, 10);

      res.json({
        challenge,
        userScore,
        leaderboard,
      });
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
      res.status(500).json({ message: "Failed to fetch daily challenge" });
    }
  });

  app.post("/api/daily-challenge/start", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      
      let challenge = await storage.getDailyChallenge(today);
      if (!challenge) {
        const seed = `daily-${today}`;
        challenge = await storage.createDailyChallenge({
          date: today,
          seed,
          rulesConfig: {} as any,
        });
      }

      // Initialize game with challenge seed
      const gameState = GameEngine.initializeGame(challenge.seed);

      // Create match record
      const match = await storage.createMatch({
        mode: 'DAILY',
        status: 'ACTIVE',
        player1Id: userId,
        seed: challenge.seed,
        finalState: gameState as any,
        moveHistory: [] as any,
      });

      // Create active game
      const activeGame = await storage.createActiveGame({
        matchId: match.id,
        currentState: gameState as any,
        currentTurn: userId,
      });

      res.json({
        gameId: activeGame.id,
        matchId: match.id,
        state: gameState,
        challengeId: challenge.id,
      });
    } catch (error) {
      console.error("Error starting daily challenge:", error);
      res.status(500).json({ message: "Failed to start daily challenge" });
    }
  });

  // ============ Match History ============
  app.get("/api/matches/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getMatchHistory(userId, 20);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching match history:", error);
      res.status(500).json({ message: "Failed to fetch match history" });
    }
  });

  return httpServer;
}
