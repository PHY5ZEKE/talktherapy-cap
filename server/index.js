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
const WSS_PORT = 8080;
const server = http.createServer(app);

const wss = new WebSocketServer({
  port: Number(process.env.PORT) || WSS_PORT,
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
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
let currentRoom = null;

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
    ws.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "join-room") {
        currentRoom = data.roomID;

        // Create room if not array rooms
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = {
            users: [],
          };
        }

        // Check room capacity
        if (rooms[currentRoom].users.length >= MAX) {
          console.log(
            `Room full! Capacity: ${rooms[currentRoom].users.length}`
          );

          ws.send(roomFullMessage);
          ws.close();
        } else {
          rooms[currentRoom].users.push({
            name: data.user,
            connection: ws,
          });

          console.log(
            `Joining... Capacity: ${rooms[currentRoom].users.length}`
          );

          console.log(
            `Current users in room ${currentRoom}:`,
            rooms[currentRoom].users.map((user) => user.name)
          );
        }
      }

      if (data.type === "chat-message") {
        if (currentRoom) {
          const broadcastMessage = JSON.stringify({
            type: "chat-message",
            message: data.message,
            sender: data.sender,
          });

          console.log(`${data.sender}: ${data.message}`);

          rooms[currentRoom].users.forEach((user) => {
            if (user.connection.readyState === WebSocket.OPEN) {
              user.connection.send(broadcastMessage);
            }
          });
        }
      }

      if (data.type === "leave-room") {
        console.log(`User ${data.user} has left the room: ${currentRoom}`);

        rooms[currentRoom].users = rooms[currentRoom].users.filter(
          (client) => client.name !== data.user
        );

        console.log(
          `Capacity in room ${currentRoom} is : ${rooms[currentRoom].users.length}
          with users ${rooms[currentRoom].users}`
        );
      }

      if (
        ["offer", "answer", "ice-candidate"].includes(data.type) &&
        currentRoom
      ) {
        if (currentRoom) {
          rooms[currentRoom].users.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      }
    });

    ws.on("close", () => {
      // Remove the client from the room when they disconnect
      console.log(`successfully disconnected from connection`);
    });
  });
} catch (error) {
  console.error(error);
}
