import type { Request, Response } from "express";
import type { AuthenticateRequest } from "types/response";
import { SAFE_CLINICIAN_FIELDS } from "config/whitelist";

import Schedule from "models/schedule";
import Clinician from "models/clinician";

// helper function for id
async function getClinicianDetails(id: string) {
  return await Clinician.findById(id).select(SAFE_CLINICIAN_FIELDS);
}

export const createSchedule = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const { id, name } = req.user;

    const clinician = await getClinicianDetails(id);
    if (!clinician) {
      return res.status(404).json({
        error: "Not Found",
        message: "Clinician profile not found",
      });
    }

    const { day, start_time, end_time, start_date, end_date, details } =
      req.body;

    if (!day || !start_time || !end_time || !start_date || !end_date) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Please provide all required schedule information",
      });
    }

    const schedule = new Schedule({
      clinician_id: id,
      clinician_name: name,
      clinician_specialization: clinician.specialization,
      day,
      start_time,
      end_time,
      frequency: "Weekly",
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status: "Available",
      details: details || { patient_id: null, patient_name: null },
    });

    await schedule.save();

    res.status(201).json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while creating schedule";

    res.status(500).json({
      error: "Failed to create schedule",
      message: errorMessage,
    });
  }
};
