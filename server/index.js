const path = require("path");

const config = require("./config.json");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

mongoose
  .connect(config.connectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const express = require("express");
const cors = require("cors");
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
    origin: "*",
  })
);

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Use the routes

app.use("/patient-slp", patientSlpRoutes);
app.use("/clinicianSLP", clinicianSLPRoutes);
app.use("/adminSLP", adminSLPRoutes);
app.use("/super-admin", superAdminSLPRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/api/contents", contentRoute);
app.use("/appointments", appointmentRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
