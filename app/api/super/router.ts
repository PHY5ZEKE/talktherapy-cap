import { Router } from "express";

import { createAdmin } from "./create";
import {
  getAllPatients,
  getAllAdmins,
  getAllClinicians,
  getRolesCount,
} from "./get";

const superAdminRouter = Router();

superAdminRouter.post("/create/admin", createAdmin);

superAdminRouter.get("/patients", getAllPatients);
superAdminRouter.get("/admins", getAllAdmins);
superAdminRouter.get("/clinicians", getAllClinicians);
superAdminRouter.get("/roles-count", getRolesCount);

export default superAdminRouter;
