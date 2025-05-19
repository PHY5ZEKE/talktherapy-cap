import { Router } from "express";

import { getAppointments } from "./getAppointments";

const patientRouter = Router();

// get all appointments
patientRouter.get("/appointments", getAppointments);

export default patientRouter;
