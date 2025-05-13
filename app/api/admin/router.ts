import { Router } from "express";

import { registerAdmin } from "./register";

const adminRouter = Router();

adminRouter.post("/register", registerAdmin);

export default adminRouter;
