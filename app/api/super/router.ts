import { Router } from "express";

import { createAdmin } from "./create";
import { getAllPatients, getAllAdmins } from "./get";

const superAdminRouter = Router();

superAdminRouter.post("/create/admin", createAdmin);
superAdminRouter.get("/patients", getAllPatients);
superAdminRouter.get("/admins", getAllAdmins);

export default superAdminRouter;
