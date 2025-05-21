import { Router } from "express";

import { addAdmin } from "./signup";
import { getAllPatients } from "./patient";

const superAdminRouter = Router();

superAdminRouter.post("/create/admin", addAdmin);
superAdminRouter.get("/patients", getAllPatients);

export default superAdminRouter;
