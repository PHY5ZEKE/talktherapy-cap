import { Router } from "express";

import { login } from "./login";
import { getToken, validateToken } from "./token";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/get-cookie", getToken);
authRouter.get("/validate-token", validateToken);

export default authRouter;
