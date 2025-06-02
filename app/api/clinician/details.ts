import type { Request, Response } from "express";
import type { AuthenticateRequest } from "types/response";
import Clinician from "models/clinician";

export const getClinicianDetails = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    // get clinician from logged in user from token: id
    const clinician = await Clinician.findById(req.user.id);

    if (!clinician) {
      return res.status(404).json({
        error: "Not Found",
        message: "Clinician profile not found",
      });
    }

    res.status(200).json({
      message: "Clinician profile retrieved successfully",
      clinician,
    });
  } catch (error) {
    console.error("Error retrieving clinician details:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occured while fetching clinician";

    res.status(500).json({
      error: "Failed to retrieve clinician details",
      message: errorMessage,
    });
  }
};
