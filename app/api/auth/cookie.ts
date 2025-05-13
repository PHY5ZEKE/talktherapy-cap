import type { Request, Response } from "express";

import jwt from "jsonwebtoken";

export const getCookie = async (req: Request, res: Response) => {
  const token = req.cookies["token"];

  try {
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error getting cookie:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const token = req.cookies["token"];

  try {
    const payload = jwt.verify(token, process.env.VITE_JWT_SECRET as string);
    return res.status(200).json({ valid: true, token: payload });
  } catch (error) {
    return res.status(401).json({ valid: false });
  }
};
