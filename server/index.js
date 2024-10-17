const path = require("path");
const http = require("http");
const config = require("./config.json");
const mongoose = require("mongoose");

const WebSocket = require("ws");

const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

mongoose
  .connect(config.connectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const app = express();

const patientSlpRoutes = require("./routes/patientSlp.route.js");
const clinicianSLPRoutes = require("./routes/clinicianSLP.route.js");
const adminSLPRoutes = require("./routes/adminSLP.route.js");
const superAdminSLPRoutes = require("./routes/superAdminSLP.route.js");
const scheduleRoutes = require("./routes/schedule.route.js");
const contentRoute = require("./routes/content.route.js");
const appointmentRoute = require("./routes/appointment.route.js");

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

// PORT
const HTTPS_PORT = process.env.PORT || 8080;

// HTTP Server for Express and WS Port
const server = http.createServer(app);

// WebSocket Server
const WebSocketServer = WebSocket.Server;
const wss = new WebSocket.Server({ server });

// Rooms
const rooms = {};
const MAX = 2;

try {
  // ws connection start
  wss.on("connection", (ws) => {
    let currentRoom = null;

    ws.on("message", (message) => {
      const data = JSON.parse(message);

      if (data.type === "join-room") {
        // Add client to the room
        currentRoom = data.roomID;
        if (!rooms[currentRoom]) {
          rooms[currentRoom] = [];
        }
        if (rooms[currentRoom].length >= MAX) {
          // Room is full, redirect user
          ws.send(
            JSON.stringify({
              type: "room-full",
              message: "Room is full, redirecting to home page.",
              redirectURL: "/"
            })
          );
          ws.close();
        } else {
          // Add client to the room
          rooms[currentRoom].push(ws);
        }
      }

      if (data.type === "message") {
        // Broadcast message to all clients in the same room, including the sender
        if (currentRoom) {
          rooms[currentRoom].forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "message",
                  message: data.message,
                  sender: data.sender, // Include sender's UUID for all clients
                })
              );
            }
          });
        }
      }

      if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
        // Relay WebRTC signaling messages only to other clients in the same room
        if (currentRoom) {
          rooms[currentRoom].forEach((client) => {
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
        rooms[currentRoom] = rooms[currentRoom].filter((client) => client !== ws);

        // Notify other clients in the room that this client has left
        rooms[currentRoom].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "user-left",
                userId: data.uuid, // Or use any other unique identifier
              })
            );
          }
        });

        // Clean up the room if it's empty
        if (rooms[currentRoom].length === 0) {
          delete rooms[currentRoom];
          console.log(`Room ${currentRoom} is empty and deleted`);
        }
      }
    });
  });
} catch (error) {
  console.error(error);
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
