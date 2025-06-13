import type { Request, Response } from "express";
import { parseQueryParams, buildFilterQuery } from "utils/http";
import {
  SAFE_PATIENT_FIELDS,
  SAFE_ADMIN_FIELDS,
  SAFE_CLINICIAN_FIELDS,
} from "config/whitelist";

import Patient from "models/patient";
import Admin from "models/admin";
import Clinician from "models/clinician";

// GET All Patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    // parse query parameters
    const { page, limit, offset, filters, ...rest } = parseQueryParams(
      req.query
    );

    const filterQuery = buildFilterQuery(
      {
        ...(filters.length > 0 ? { diagnosis: filters } : {}),
      },
      rest
    );

    const [data, totalRows] = await Promise.all([
      Patient.find(filterQuery, SAFE_PATIENT_FIELDS)
        .skip(offset)
        .limit(limit)
        .exec(),
      Patient.countDocuments(filterQuery).exec(),
    ]);

    const totalPages = Math.ceil(totalRows / limit);

    const response = {
      data,
      offset,
      limit,
      total_rows: totalRows,
      total_pages: totalPages,
      current_page: page,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GeT All Admins
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    // parse query parameters
    const { page, limit, offset, filters } = parseQueryParams(req.query);

    // TODO: Implement search
    // const filterQuery = buildFilterQuery(filters, "diagnosis");

    const [data, totalRows] = await Promise.all([
      Admin.find({}, SAFE_ADMIN_FIELDS).skip(offset).limit(limit).exec(),
      Admin.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(totalRows / limit);

    const response = {
      data,
      offset,
      limit,
      total_rows: totalRows,
      total_pages: totalPages,
      current_page: page,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET All Clinicians
export const getAllClinicians = async (req: Request, res: Response) => {
  try {
    // parse query parameters
    const { page, limit, offset, filters, ...rest } = parseQueryParams(
      req.query
    );

    const filterQuery = buildFilterQuery(
      {
        ...(filters.length > 0 ? { specialization: filters } : {}),
      },
      rest
    );
    const [data, totalRows] = await Promise.all([
      Clinician.find(filterQuery, SAFE_CLINICIAN_FIELDS)
        .skip(offset)
        .limit(limit)
        .exec(),
      Clinician.countDocuments(filterQuery).exec(),
    ]);

    const totalPages = Math.ceil(totalRows / limit);

    const response = {
      data,
      offset,
      limit,
      total_rows: totalRows,
      total_pages: totalPages,
      current_page: page,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching clinicians:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET All Admins, Patients, and Clincians (count only)
export const getRolesCount = async (req: Request, res: Response) => {
  try {
    const [patientsCount, adminsCount, cliniciansCount] = await Promise.all([
      Patient.countDocuments(),
      Admin.countDocuments(),
      Clinician.countDocuments(),
    ]);

    const response = {
      patients: patientsCount,
      admins: adminsCount,
      clinicians: cliniciansCount,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching roles count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
