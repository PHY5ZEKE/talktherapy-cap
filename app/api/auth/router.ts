import { Router } from "express";

import { login } from "./login";
import { getCookie, validateToken } from "./cookie";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/get-cookie", getCookie);
authRouter.get("/validate-token", validateToken);

export default authRouter;
