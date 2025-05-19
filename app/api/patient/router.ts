import { Router } from "express";

import { getAllAppointments } from "./appointments";

const patientRouter = Router();

// get all appointments with pagination
// query params: page, limit, filters
// page: number
// limit: number
// filters: string[]
patientRouter.get("/appointments", getAllAppointments);

export default patientRouter;
