const WebSocket = require("ws");

class WebSocketServer {
  constructor() {
    if (WebSocketServer.instance) {
      return WebSocketServer.instance;
    }

    this.wss = null;
    this.MAX_CAPACITY = 2;
    this.rooms = {};
    this.clients = new Set();

    WebSocketServer.instance = this;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", (ws) => this.handleConnection(ws));
    console.log("WebSocket Server initialized.");
  }

  handleConnection(ws) {
    this.clients.add(ws);
    ws.on("message", (message) => this.handleMessage(ws, message));
    ws.on("close", () => this.handleClose(ws));
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "join-room":
          this.joinRoom(ws, data);
          break;
        case "chat-message":
          this.broadcastMessage(ws, data);
          break;
        case "leave-room":
          this.leaveRoom(data);
          break;
        case "notification":
          this.sendNotification(ws);
          break;
        case "fetch-action":
          this.fetchAction(ws);
          break;
        case "offer":
        case "answer":
        case "ice-candidate":
          this.relaySignaling(ws, data);
          break;
        case "stop-session":
          this.stopSession(data.roomID);
          break;
        case "voice-recognition-result": 
          this.broadcastToRoom(data.roomID, message, ws); 
          break;
        default:
          console.error("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid message format" })
      );
    }
  }

  joinRoom(ws, data) {
    const { roomID, user } = data;

    if (!this.rooms[roomID]) {
      this.rooms[roomID] = { users: [] };
    }

    const room = this.rooms[roomID];
    if (room.users.some((u) => u.name === user)) {
      ws.send(
        JSON.stringify({
          type: "user-already-in-room",
          message: "User is already in the room.",
          redirectURL: "/",
        })
      );
      return;
    }
    if (room.users.length >= this.MAX_CAPACITY) {
      ws.send(
        JSON.stringify({
          type: "room-full",
          message: "Room is full, redirecting to home page.",
          redirectURL: "/",
        })
      );
      ws.close();
      return;
    }
    room.users.push({ name: user, connection: ws });
    console.log(
      `User ${user} joined room ${roomID}. Current users:`,
      room.users.map((u) => u.name)
    );

    const broadcastData = JSON.stringify(
      {
        type: "join-room",
        user
      }
    )
    this.broadcastToRoom(roomID, broadcastData);
  }

  leaveRoom(data) {
    const { roomID, user } = data;
    const room = this.rooms[roomID];

    if (!room) return;

    room.users = room.users.filter((u) => u.name !== user);

    console.log(
      `User ${user} left room ${roomID}. Remaining users:`,
      room.users.map((u) => u.name)
    );

    if (room.users.length === 0) {
      delete this.rooms[roomID];
      console.log(`Room ${roomID} deleted as it is now empty.`);
    }

    this.broadcastToRoom(roomID, {
      type: "leave-room",
      user,
    });
  }

  broadcastMessage(ws, data) {
    const { roomID, message, sender } = data;
    const room = this.rooms[roomID];

    if (!room) return;

    const broadcastData = JSON.stringify({
      type: "chat-message",
      message,
      roomID,
      sender,
    });

    console.log("Broadcasting chat message:", broadcastData);
    this.broadcastToRoom(roomID, broadcastData);
  }

  broadcastToRoom(roomID, message, excludeSocket = null) {
    const room = this.rooms[roomID];
    if (!room) return;

    console.log(`Broadcasting to room ${roomID}:`, message);
    room.users.forEach((user) => {
      if (user.connection.readyState === WebSocket.OPEN) {
        user.connection.send(message);
      }
    });
  }

  sendNotification(data) {
    const { message, date } = data;
    const notificationMessage = JSON.stringify({
      type: "notification",
      message,
      date,
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(notificationMessage);
      }
    });
  }

  fetchAction(data) {
    const { message } = data;
    const notificationMessage = JSON.stringify({
      type: "fetch-action",
      message,
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(notificationMessage);
      }
    });
  }

  relaySignaling(ws, data) {
    const { roomID } = data;
    const room = this.rooms[roomID];
    if (!room) return;

    room.users.forEach((user) => {
      if (
        user.connection !== ws &&
        user.connection.readyState === WebSocket.OPEN
      ) {
        user.connection.send(JSON.stringify(data));
      }
    });
  }

  stopSession(roomID) {
    const room = this.rooms[roomID];
    if (!room) return;

    room.users.forEach((user) => {
      if (user.connection.readyState === WebSocket.OPEN) {
        user.connection.send(JSON.stringify({ type: "stop-session" }));
        user.connection.close();
      }
    });

    delete this.rooms[roomID];
    console.log(`Room ${roomID} and all its users have been removed.`);
  }

  handleClose(ws) {
    this.clients.delete(ws);
    console.log("Client disconnected");
  }
}

module.exports = new WebSocketServer();
