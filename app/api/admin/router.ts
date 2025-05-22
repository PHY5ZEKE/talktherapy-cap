import { Router } from "express";

import { createClinician } from "./create";
import { getAllPatients, getAllClinicians } from "./get";

const adminRouter = Router();

adminRouter.post("/create/clinician", createClinician);
adminRouter.get("/patients", getAllPatients);
adminRouter.get("/clinicians", getAllClinicians);

export default adminRouter;
