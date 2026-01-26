# Kings Corner Arena

## Overview

Kings Corner Arena is a mobile-first card game web application that delivers the classic Kings Corner card game experience. The app targets iOS users with a focus on quick 3-5 minute matches, AI opponents with multiple difficulty levels, daily challenges with leaderboards, and real-time multiplayer capabilities. The project is designed as a Progressive Web App (PWA) optimized for iOS with plans for App Store submission.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for game state, TanStack Query for server state
- **Styling**: Tailwind CSS v4 with custom "Royal Arena" theme (emerald green and gold aesthetic)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for card animations and transitions
- **Build Tool**: Vite with custom plugins for meta images and Replit integration

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, Game, Privacy, Support, Terms)
- Reusable UI components in `client/src/components/ui/`
- Game-specific components in `client/src/components/game/`
- Custom hooks in `client/src/hooks/`
- Game state managed through `client/src/store/game-store.ts`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect with Passport.js)
- **Real-time**: WebSocket server for multiplayer functionality
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

The server follows a modular structure:
- `server/routes.ts` - API endpoint definitions
- `server/storage.ts` - Database access layer implementing IStorage interface
- `server/game/engine.ts` - Authoritative game logic (card rules, move validation)
- `server/game/ai.ts` - AI opponent with three difficulty levels (Easy, Standard, Hard)
- `server/replit_integrations/auth/` - Authentication module

### Game Engine
The game engine exists on both client and server:
- Server-side (`server/game/engine.ts`) is authoritative for multiplayer
- Client-side (`client/src/lib/game-engine.ts`) provides immediate feedback
- Implements Kings Corner rules: build down in alternating colors on tableau, build down in same suit on foundations

### Database Schema
Located in `shared/schema.ts`:
- `users` and `sessions` - Replit Auth tables (mandatory)
- `profiles` - Extended user data (rating, wins, stats)
- `matches` - Game history with modes (AI, RANKED, FRIEND, DAILY)
- `activeGames` - Currently running games
- `dailyChallenges` and `dailyChallengeScores` - Daily challenge system

## External Dependencies

### Database
- PostgreSQL database (provisioned via Replit)
- Drizzle ORM for type-safe queries
- Connection via `DATABASE_URL` environment variable

### Authentication
- Replit Auth (OpenID Connect)
- Requires `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables

### Third-Party Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for card movements
- **ws**: WebSocket implementation for real-time multiplayer
- **passport**: Authentication middleware
- **zod**: Runtime type validation

### PWA Configuration
- Manifest at `public/manifest.json`
- iOS-specific meta tags and splash screens
- Apple touch icons for home screen installation