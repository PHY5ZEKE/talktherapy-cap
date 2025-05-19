import { Router } from "express";

import { registerAdmin } from "./admin";
import { registerClinician } from "./clinician";
import { registerPatient } from "./patient";

const signupRouter = Router();

signupRouter.post("/admin", registerAdmin);
signupRouter.post("/clinician", registerClinician);
signupRouter.post("/patient", registerPatient);

export default signupRouter;
