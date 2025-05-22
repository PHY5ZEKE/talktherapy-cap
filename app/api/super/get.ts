import type { Request, Response } from "express";
import { parseQueryParams, buildFilterQuery } from "utils/http";
import { SAFE_PATIENT_FIELDS, SAFE_ADMIN_FIELDS } from "config/whitelist";

import Patient from "models/patient";
import Admin from "~/models/admin";

// GET All Patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    // parse query parameters
    const { page, limit, offset, filters } = parseQueryParams(req.query);

    const filterQuery = buildFilterQuery(filters, "diagnosis");

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
