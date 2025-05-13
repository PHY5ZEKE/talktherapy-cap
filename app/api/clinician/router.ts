import { Router } from "express";

import { registerClinician } from "./register";

const clinicianRouter = Router();

clinicianRouter.post("/register", registerClinician);

export default clinicianRouter;
