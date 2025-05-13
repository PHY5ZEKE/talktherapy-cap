import { Router } from "express";

import { registerPatient } from "./register";

const patientRouter = Router();

patientRouter.post("/register", registerPatient);

export default patientRouter;
