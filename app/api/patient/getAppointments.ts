import type { Request, Response } from "express";

import { sampleAppointments } from "config/sample";

// get all appointments for a patient using config/sample sampleAppointments
export const getAppointments = async (req: Request, res: Response) => {
  try {
    res.status(200).json(sampleAppointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to get appointments" });
  }
};
