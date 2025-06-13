import { Router } from "express";

import { getAllAppointments, getClinicianSchedules } from "./appointments";

const patientRouter = Router();

patientRouter.get("/appointments", getAllAppointments);
patientRouter.get("/schedule", getClinicianSchedules);

export default patientRouter;
