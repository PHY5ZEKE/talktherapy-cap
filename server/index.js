const path = require("path");
const http = require("http");
const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const WebSocketServer = require("./websocket");

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
const server = http.createServer(app);

const patientSlpRoutes = require("./routes/patientSlp.route.js");
const clinicianSLPRoutes = require("./routes/clinicianSLP.route.js");
const adminSLPRoutes = require("./routes/adminSLP.route.js");
const superAdminSLPRoutes = require("./routes/superAdminSLP.route.js");
const scheduleRoutes = require("./routes/schedule.route.js");
const contentRoute = require("./routes/content.route.js");
const appointmentRoute = require("./routes/appointment.route.js");
const soapSLPRoute = require("./routes/soapSLP.route.js");
const notificationRoutes = require("./routes/notification.route.js");
const { send } = require("process");

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
app.use("/api/notification-slp", notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// WebSocket Server
WebSocketServer.initialize(server);

// Cron
require('./cron-job.js')

const PORT = process.env.PORT || 8000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
