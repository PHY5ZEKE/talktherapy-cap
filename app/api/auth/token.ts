import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

// custom request type
interface AuthenticateRequest extends Request {
  user?: any;
}

export const getToken = async (req: Request, res: Response) => {
  const token = req.cookies["token"];
  if (!token)
    return res
      .status(401)
      .json({ valid: false, message: "Unauthorized access" });
  try {
    const payload = jwt.verify(token, process.env.VITE_JWT_SECRET as string);
    return res.status(200).json({ valid: true, token: payload });
  } catch (error) {
    console.error("Error getting cookie:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// this adds the user
export const validateToken = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
) => {
  // get token from cookie
  const token = req.cookies["token"];
  if (!token)
    return res
      .status(401)
      .json({ valid: false, message: "Unauthorized access" });

  try {
    const payload = jwt.verify(token, process.env.VITE_JWT_SECRET as string);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

// check for authorized roles
// accepts a list of roles and returns a middleware function
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ valid: false, message: "Unauthorized access: role mismatch" });
    }
    next();
  };
};
