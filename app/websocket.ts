import { WebSocketServer, WebSocket } from "ws";
import { EventEmitter } from "events";
import type { CLIENT, ROOM, MESSAGE, TYPE } from "./types/websocket";

// CONSTANTS
const MAX_CAPACITY = 2;
const PING_INTERVAL = 30000; // 30s
const PONG_TIMEOUT = 5000; // 5s
const MAX_MISSED_PONGS = 3; // missed pongs before disconnection
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB

// VC ROOM
class RoomManager extends EventEmitter {
  private rooms: Map<string, ROOM> = new Map();
  private clients: Map<string, CLIENT> = new Map();

  createRoom(id: string): ROOM {
    if (this.rooms.has(id)) {
      throw new Error("Room already exists");
    }
    const room: ROOM = {
      id,
      clients: new Set(),
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id: string): ROOM | undefined {
    return this.rooms.get(id);
  }

  deleteRoom(id: string): boolean {
    const room = this.rooms.get(id);
    if (!room) return false;

    // NOTIFY ALL WHEN ROOM IS DELETED
    room.clients.forEach((client) => {
      this.removeClientFromRoom(client, id);
    });

    return this.rooms.delete(id);
  }

  addClientToRoom(client: CLIENT, roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;
    if (room.clients.size >= MAX_CAPACITY) return false;

    room.clients.add(client);
    client.roomId = roomId;
    this.clients.set(client.id, client);
    return true;
  }

  removeClientFromRoom(client: CLIENT, roomId?: string): boolean {
    const room = this.getRoom(roomId || client.roomId || "");
    if (!room) return false;

    room.clients.delete(client);
    client.roomId = undefined;
    this.clients.delete(client.id);

    // CLOSE EMPTY ROOMS
    if (room.clients.size === 0) {
      this.deleteRoom(room.id);
    }

    return true;
  }

  broadcastToRoom(
    roomId: string,
    message: MESSAGE,
    excludeClient?: CLIENT
  ): void {
    const room = this.getRoom(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

// WEBSOCKET SERVER
class WebSocketService {
  private wss: WebSocketServer;
  private roomManager: RoomManager;
  private pingInterval: NodeJS.Timeout;
  private heartbeatMap: Map<
    string,
    {
      missedPongs: number;
      lastPingTime: number;
      timeoutId?: NodeJS.Timeout;
    }
  >;

  constructor(port: number) {
    this.roomManager = new RoomManager();
    this.heartbeatMap = new Map();
    this.wss = new WebSocketServer({
      port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
      },
      maxPayload: MAX_MESSAGE_SIZE,
    });

    this.setupWebSocketServer();
    this.pingInterval = setInterval(() => this.ping(), PING_INTERVAL);
  }

  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: CLIENT) => {
      ws.id = Math.random().toString(36).substring(7);
      ws.isAlive = true;

      // CONNECTION TRACKER
      this.heartbeatMap.set(ws.id, {
        missedPongs: 0,
        lastPingTime: Date.now(),
      });

      ws.on("pong", () => {
        const heartbeat = this.heartbeatMap.get(ws.id);
        if (heartbeat) {
          // CLEAR WHEN PONG IS RECEIVED
          if (heartbeat.timeoutId) {
            clearTimeout(heartbeat.timeoutId);
            heartbeat.timeoutId = undefined;
          }

          // RESET MISSED PONGS COUNTER
          heartbeat.missedPongs = 0;
          heartbeat.lastPingTime = Date.now();
          ws.isAlive = true;
        }
      });

      ws.on("message", (data: string) => {
        try {
          const message: MESSAGE = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Error parsing message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        // CLEAN HEARTBEAT TRACKING
        const heartbeat = this.heartbeatMap.get(ws.id);
        if (heartbeat?.timeoutId) {
          clearTimeout(heartbeat.timeoutId);
        }
        this.heartbeatMap.delete(ws.id);

        // CLEAN ROOM MEMBERSHIP
        if (ws.roomId) {
          this.roomManager.removeClientFromRoom(ws, ws.roomId);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.sendError(ws, "Internal server error");
      });
    });
  }

  private ping(): void {
    const now = Date.now();
    this.wss.clients.forEach((ws) => {
      const client = ws as CLIENT;
      const heartbeat = this.heartbeatMap.get(client.id);

      if (!heartbeat) {
        // NO HEARTBEAT TRACKING FOR THIS CLIENT, INITIALIZE IT
        this.heartbeatMap.set(client.id, {
          missedPongs: 0,
          lastPingTime: now,
        });
        return;
      }

      // CHECK IF WE'VE MISSED TOO MANY PONGS
      if (heartbeat.missedPongs >= MAX_MISSED_PONGS) {
        console.log(
          `Client ${client.id} missed too many pongs, terminating connection`
        );
        this.terminateClient(client);
        return;
      }

      // CHECK IF THE LAST PING WAS TOO LONG AGO
      if (now - heartbeat.lastPingTime > PING_INTERVAL * 2) {
        console.log(
          `Client ${client.id} last ping too old, terminating connection`
        );
        this.terminateClient(client);
        return;
      }

      try {
        // SEND PING AND SET UP TIMEOUT
        client.ping();
        heartbeat.missedPongs++;
        heartbeat.lastPingTime = now;

        // SET UP TIMEOUT FOR PONG RESPONSE
        if (heartbeat.timeoutId) {
          clearTimeout(heartbeat.timeoutId);
        }

        heartbeat.timeoutId = setTimeout(() => {
          const currentHeartbeat = this.heartbeatMap.get(client.id);
          if (
            currentHeartbeat &&
            currentHeartbeat.missedPongs >= MAX_MISSED_PONGS
          ) {
            console.log(
              `Client ${client.id} pong timeout, terminating connection`
            );
            this.terminateClient(client);
          }
        }, PONG_TIMEOUT);
      } catch (error) {
        console.error(`Error sending ping to client ${client.id}:`, error);
        this.terminateClient(client);
      }
    });
  }

  private terminateClient(client: CLIENT): void {
    try {
      // CLEAN HEARTBEAT TRACKING
      const heartbeat = this.heartbeatMap.get(client.id);
      if (heartbeat?.timeoutId) {
        clearTimeout(heartbeat.timeoutId);
      }
      this.heartbeatMap.delete(client.id);

      // CLEAN ROOM MEMBERSHIP
      if (client.roomId) {
        this.roomManager.removeClientFromRoom(client, client.roomId);
      }

      // TERMINATE THE CONNECTION
      client.terminate();
    } catch (error) {
      console.error(`Error terminating client ${client.id}:`, error);
    }
  }

  private handleMessage(ws: CLIENT, message: MESSAGE): void {
    const handlers: Record<TYPE, (ws: CLIENT, payload: any) => void> = {
      "join-room": (ws, payload) => {
        const { roomId } = payload;
        if (!roomId) {
          return this.sendError(ws, "Room ID is required");
        }

        let room = this.roomManager.getRoom(roomId);
        if (!room) {
          room = this.roomManager.createRoom(roomId);
        }

        if (this.roomManager.addClientToRoom(ws, roomId)) {
          this.roomManager.broadcastToRoom(
            roomId,
            {
              type: "notification",
              payload: { message: "New client joined the room" },
            },
            ws
          );
        } else {
          this.sendError(ws, "Room is full or does not exist");
        }
      },

      "leave-room": (ws, payload) => {
        const { roomId } = payload;
        if (this.roomManager.removeClientFromRoom(ws, roomId)) {
          this.roomManager.broadcastToRoom(roomId, {
            type: "notification",
            payload: { message: "Client left the room" },
          });
        }
      },

      "send-chat": (ws, payload) => {
        if (!ws.roomId) {
          return this.sendError(ws, "Not in a room");
        }
        this.roomManager.broadcastToRoom(ws.roomId, {
          type: "send-chat",
          payload: { ...payload, senderId: ws.id },
        });
      },

      "stop-session": (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(ws.roomId, {
          type: "stop-session",
          payload,
        });
      },

      "camera-status": (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(ws.roomId, {
          type: "camera-status",
          payload: { ...payload, clientId: ws.id },
        });
      },

      "mic-status": (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(ws.roomId, {
          type: "mic-status",
          payload: { ...payload, clientId: ws.id },
        });
      },

      notification: (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(ws.roomId, {
          type: "notification",
          payload,
        });
      },

      "fetch-action": (ws, payload) => {
        ws.send(
          JSON.stringify({
            type: "fetch-action",
            payload: { status: "success" },
          })
        );
      },

      offer: (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(
          ws.roomId,
          {
            type: "offer",
            payload: { ...payload, senderId: ws.id },
          },
          ws
        );
      },

      answer: (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(
          ws.roomId,
          {
            type: "answer",
            payload: { ...payload, senderId: ws.id },
          },
          ws
        );
      },

      "ice-candidate": (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(
          ws.roomId,
          {
            type: "ice-candidate",
            payload: { ...payload, senderId: ws.id },
          },
          ws
        );
      },

      "voice-recognition-result": (ws, payload) => {
        if (!ws.roomId) return;
        this.roomManager.broadcastToRoom(ws.roomId, {
          type: "voice-recognition-result",
          payload: { ...payload, senderId: ws.id },
        });
      },
    };

    const handler = handlers[message.type];
    if (handler) {
      handler(ws, message.payload);
    } else {
      this.sendError(ws, "Unknown message type");
    }
  }

  private sendError(ws: CLIENT, message: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { message },
        })
      );
    }
  }

  public close(): void {
    // CLEAR PING INTERVAL
    clearInterval(this.pingInterval);

    // CLEAR ALL HEARTBEAT TIMEOUTS
    this.heartbeatMap.forEach((heartbeat, clientId) => {
      if (heartbeat.timeoutId) {
        clearTimeout(heartbeat.timeoutId);
      }
    });
    this.heartbeatMap.clear();

    // CLOSE ALL CONNECTIONS
    this.wss.clients.forEach((ws) => {
      const client = ws as CLIENT;
      try {
        client.close(1000, "Server shutting down");
      } catch (error) {
        console.error(`Error closing client ${client.id}:`, error);
      }
    });

    // CLOSE THE SERVER
    this.wss.close();
  }
}

// CREATE AND EXPORT THE WEBSOCKET SERVICE INSTANCE
const wsService = new WebSocketService(8080);

// HANDLE PROCESS TERMINATION
process.on("SIGTERM", () => {
  wsService.close();
});

process.on("SIGINT", () => {
  wsService.close();
});

export default wsService;
