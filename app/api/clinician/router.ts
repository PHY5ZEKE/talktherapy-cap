import { Router } from "express";
import { createSchedule } from "./appointments";

const clinicianRouter = Router();

// Schedule routes
clinicianRouter.post("/create/schedule", createSchedule);

export default clinicianRouter;
