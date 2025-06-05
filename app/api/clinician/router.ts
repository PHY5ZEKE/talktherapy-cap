import { Router } from "express";
import { createSchedule, getClinicianScheduleById } from "./appointments";

const clinicianRouter = Router();

// Schedule routes
clinicianRouter.post("/create/schedule", createSchedule);
clinicianRouter.get("/schedule/", getClinicianScheduleById);

export default clinicianRouter;
