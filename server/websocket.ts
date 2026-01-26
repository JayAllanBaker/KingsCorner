import { WebSocketServer, WebSocket } from "ws";
import type { Server as HTTPServer } from "http";
import { log } from "./index";

interface WSClient {
  ws: WebSocket;
  userId?: string;
  gameId?: string;
}

const clients: Map<string, WSClient> = new Map();

export async function setupWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    const clientId = Math.random().toString(36).substring(7);
    const client: WSClient = { ws };
    clients.set(clientId, client);

    log(`WebSocket client connected: ${clientId}`, "websocket");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(clientId, message);
      } catch (error) {
        log(`WebSocket error parsing message: ${error}`, "websocket");
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      log(`WebSocket client disconnected: ${clientId}`, "websocket");
    });

    ws.on("error", (error) => {
      log(`WebSocket error: ${error}`, "websocket");
    });
  });

  log("WebSocket server initialized", "websocket");
}

function handleMessage(clientId: string, message: any) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case "auth":
      client.userId = message.userId;
      log(`Client ${clientId} authenticated as user ${message.userId}`, "websocket");
      break;
    
    case "join_game":
      client.gameId = message.gameId;
      log(`Client ${clientId} joined game ${message.gameId}`, "websocket");
      break;

    case "game_move":
      // Broadcast move to all clients in the same game
      broadcastToGame(client.gameId, {
        type: "game_update",
        move: message.move,
        state: message.state,
      }, clientId);
      break;

    default:
      log(`Unknown message type: ${message.type}`, "websocket");
  }
}

function broadcastToGame(gameId: string | undefined, message: any, excludeClientId?: string) {
  if (!gameId) return;

  const clientEntries = Array.from(clients.entries());
  for (const [clientId, client] of clientEntries) {
    if (client.gameId === gameId && clientId !== excludeClientId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }
}

export function sendToClient(userId: string, message: any) {
  const clientList = Array.from(clients.values());
  for (const client of clientList) {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }
}
