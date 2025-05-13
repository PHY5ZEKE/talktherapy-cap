import { Router } from "express";

import { login } from "./login";
import { getCookie } from "./cookie";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/get-cookie", getCookie);

export default authRouter;
