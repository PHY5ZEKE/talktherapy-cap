import type { Request, Response } from "express";
import SampleData from "models/appointment";
import { parseQueryParams, buildFilterQuery } from "utils/http";

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    // parse query parameters
    const { page, limit, offset, filters } = parseQueryParams(req.query);

    const filterQuery = buildFilterQuery(filters);
    const [data, totalRows] = await Promise.all([
      SampleData.find(filterQuery).sort({ date: -1 }).skip(offset).limit(limit),
      SampleData.countDocuments(filterQuery),
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
    console.error("Error fetching appointments:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while fetching appointments";

    res.status(500).json({
      error: "Failed to get appointments",
      message: errorMessage,
    });
  }
};
