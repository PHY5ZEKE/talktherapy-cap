import type { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to logout" });
  }
};
