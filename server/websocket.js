// const WebSocket = require("ws");

// const MAX = 2;
// let rooms = {};
// let currentRoom = null;
// const clients = new Set();

// const roomFullMessage = JSON.stringify({
//   type: "room-full",
//   message: "Room is full, redirecting to home page.",
//   redirectURL: "/",
// });

// const userAlreadyInRoomMessage = JSON.stringify({
//   type: "user-already-in-room",
//   message: "User is already in the room.",
//   redirectURL: "/",
// });

// const notificationAlert = JSON.stringify({
//   type: "notification",
//   message: "New notification for user.",
// });

// function setupWebSocketServer(server) {
//   console.log("Setting up WebSocket Server");
//   const wss = new WebSocket.Server({ server });

//   wss.on("connection", (ws) => {
//     clients.add(ws);

//     ws.on("message", (message) => {
//       const data = JSON.parse(message);

//       clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(message);
//         }
//       });

//       if (data.type === "join-room") {
//         currentRoom = data.roomID;

//         if (!rooms[currentRoom]) {
//           rooms[currentRoom] = {
//             users: [],
//           };
//         }

//         if (rooms[currentRoom].users.length >= MAX) {
//           console.log(
//             `Room full! Capacity: ${rooms[currentRoom].users.length}`
//           );
//           ws.send(roomFullMessage);
//           ws.close();
//         } else {
//           rooms[currentRoom].users.push({
//             name: data.user,
//             connection: ws,
//           });

//           console.log(
//             `Joining... Capacity: ${rooms[currentRoom].users.length}`
//           );
//           console.log(
//             `Current users in room ${currentRoom}:`,
//             rooms[currentRoom].users.map((user) => user.name)
//           );
//         }
//       }

//       if (data.type === "chat-message") {
//         if (currentRoom) {
//           const broadcastMessage = JSON.stringify({
//             type: "chat-message",
//             message: data.message,
//             sender: data.sender,
//           });

//           console.log(`${data.sender}: ${data.message}`);

//           rooms[currentRoom].users.forEach((user) => {
//             if (user.connection.readyState === WebSocket.OPEN) {
//               user.connection.send(broadcastMessage);
//             }
//           });
//         }
//       }

//       if (data.type === "leave-room") {
//         console.log(`User ${data.user} has left the room: ${currentRoom}`);

//         rooms[currentRoom].users = rooms[currentRoom].users.filter(
//           (client) => client.name !== data.user
//         );

//         console.log(
//           `Capacity in room ${currentRoom} is : ${rooms[currentRoom].users.length}
//           with users ${rooms[currentRoom].users}`
//         );
//       }

//       if (data.type === "notification") {
//         ws.send(notificationAlert);
//       }

//       if (
//         ["offer", "answer", "ice-candidate"].includes(data.type) &&
//         currentRoom
//       ) {
//         if (currentRoom) {
//           rooms[currentRoom].users.forEach((client) => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//               client.send(JSON.stringify(data));
//             }
//           });
//         }
//       }
//     });

//     ws.on("close", () => {
//       console.log(`successfully disconnected from connection`);
//     });
//   });

//   return wss;
// }

// module.exports = setupWebSocketServer;

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
    } else if (room.users.length >= this.MAX_CAPACITY) {
      ws.send(
        JSON.stringify({
          type: "room-full",
          message: "Room is full, redirecting to home page.",
          redirectURL: "/",
        })
      );
      ws.close();
      return;
    } else {
      room.users.push({ name: user, connection: ws });
      console.log(
        `User ${user} joined room ${roomID}. Current users:`,
        room.users.map((u) => u.name)
      );

      this.broadcastToRoom(
        roomID,
        {
          type: "user-joined",
          user,
        },
        ws
      );
    }
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
    } else {
      this.broadcastToRoom(roomID, {
        type: "user-left",
        user,
      });
    }
  }

  broadcastMessage(ws, data) {
    const { roomID, message, sender } = data;
    const room = this.rooms[roomID];

    if (!room) return;

    const broadcastData = JSON.stringify({
      type: "chat-message",
      message,
      sender,
    });

    this.broadcastToRoom(roomID, broadcastData, ws);
  }

  broadcastToRoom(roomID, message, excludeSocket = null) {
    const room = this.rooms[roomID];
    if (!room) return;

    room.users.forEach((user) => {
      if (
        user.connection !== excludeSocket &&
        user.connection.readyState === WebSocket.OPEN
      ) {
        user.connection.send(
          typeof message === "string" ? message : JSON.stringify(message)
        );
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

  handleClose(ws) {
    this.clients.delete(ws);
    console.log("Client disconnected");
  }
}

module.exports = new WebSocketServer();
