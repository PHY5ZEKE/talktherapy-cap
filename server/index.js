const path = require("path");
const http = require("http");
const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

mongoose
  .connect(config.connectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Express App
const app = express();

// WSS Initialize
const PORT = 8000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const wss = new WebSocketServer({
  server: server,
});

const patientSlpRoutes = require("./routes/patientSlp.route.js");
const clinicianSLPRoutes = require("./routes/clinicianSLP.route.js");
const adminSLPRoutes = require("./routes/adminSLP.route.js");
const superAdminSLPRoutes = require("./routes/superAdminSLP.route.js");
const scheduleRoutes = require("./routes/schedule.route.js");
const contentRoute = require("./routes/content.route.js");
const appointmentRoute = require("./routes/appointment.route.js");
const soapSLPRoute = require("./routes/soapSLP.route.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/src", express.static(path.join(__dirname, "../src")));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://talktherapy.site",
      "http://www.talktherapy.site",
      "https://www.talktherapy.site",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Use the routes
app.use("/api/patient-slp", patientSlpRoutes);
app.use("/api/clinician-slp", clinicianSLPRoutes);
app.use("/api/admin-slp", adminSLPRoutes);
app.use("/api/super-admin-slp", superAdminSLPRoutes);
app.use("/api/schedule-slp", scheduleRoutes);
app.use("/api/contents", contentRoute);
app.use("/api/appointments-slp", appointmentRoute);
app.use("/api/soap-slp", soapSLPRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Rooms
let rooms = {};
const MAX = 2;

const roomFullMessage = JSON.stringify({
  type: "room-full",
  message: "Room is full, redirecting to home page.",
  redirectURL: "/",
});

const userAlreadyInRoomMessage = JSON.stringify({
  type: "user-already-in-room",
  message: "User is already in the room.",
  redirectURL: "/",
});

try {
  // ws connection start
  wss.on("connection", (ws) => {
    let currentRoom = null;

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "join-room") {
        console.log(`Initializing ${data.user} to join room ${data.roomID}`);
        // Add client to the room

        currentRoom = data.roomID;

        // Create room if not array rooms
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = {};
          rooms[currentRoom].clients = [];
        }
        if (rooms[currentRoom].clients.length >= MAX) {
          // Room is full, redirect user
          console.log(
            `Room full! Capacity: ${rooms[currentRoom].clients.length}`
          );
          ws.send(roomFullMessage);
          ws.close();
        } else {
          // Check if the user is already in the room
          const userAlreadyInRoom = rooms[currentRoom].clients.some(
            (client) => client.user === data.user
          );

          if (userAlreadyInRoom) {
            ws.send(userAlreadyInRoomMessage);
            ws.close();
          } else {
            // Add client to the room
            ws.user = data.user; // Assign user to WebSocket instance
            rooms[currentRoom].clients.push(ws);
            console.log(
              `Joining... Capacity: ${rooms[currentRoom].clients.length}`
            );
            console.log(
              `${data.user} successfully joined room ${data.roomID}.`
            );
            console.log(
              `Current clients in room ${currentRoom}:`,
              rooms[currentRoom].clients.map((client) => client.user)
            );
          }
        }
      }

      if (data.type === "message") {
        if (currentRoom) {
          const broadcastMessage = JSON.stringify({
            type: "message",
            message: data.message,
            sender: data.sender,
          });

          rooms[currentRoom].forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastMessage);
            }
          });
        }
      }

      if (
        ["offer", "answer", "ice-candidate"].includes(data.type) &&
        currentRoom
      ) {
        // Relay WebRTC signaling messages only to other clients in the same room
        if (currentRoom) {
          rooms[currentRoom].clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      }
    });

    ws.on("close", () => {
      // Remove the client from the room when they disconnect
      if (currentRoom) {
        console.log(
          `Current clients in room ${currentRoom}:`,
          rooms[currentRoom].clients.map((client) => client.user)
        );

        rooms[currentRoom].clients = rooms[currentRoom].clients.filter(
          (client) => client !== ws
        );
        console.log(`User ${ws} has left the room: ${currentRoom}`);
        console.log(
          `Updated clients in room ${currentRoom}:`,
          rooms[currentRoom].clients.map((client) => client.user)
        );

        // Clean up the room if it's empty
        if (rooms[currentRoom].clients.length === 0) {
          delete rooms[currentRoom];
          console.log(`Room ${currentRoom} is empty and deleted`);
        }
      }
    });
  });
} catch (error) {
  console.error(error);
}
