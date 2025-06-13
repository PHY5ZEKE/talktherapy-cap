import type { Request, Response } from "express";

import SampleData from "models/appointment";
import Schedule from "models/schedule";

import { parseQueryParams, buildFilterQuery } from "utils/http";
import { SAFE_CLINICIAN_SCHEDULE_FIELDS_PATIENT } from "config/whitelist";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    // parse query parameters
    const { page, limit, offset, filters, ...rest } = parseQueryParams(
      req.query
    );

    // Use filters array as diagnosis filter
    const filterQuery = buildFilterQuery(
      {
        clinician_specialization: filters,
      },
      rest
    );

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

// GET: Clinician Schedules
export const getClinicianSchedules = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset, filters, ...rest } = parseQueryParams(
      req.query
    );

    let selectedDate: dayjs.Dayjs | null = null;
    if (rest.selectedDate) {
      const parsedDate = dayjs.utc(rest.selectedDate as string); // parse as UTC
      if (parsedDate.isValid()) {
        selectedDate = parsedDate.startOf("day"); // normalize to 00:00:00 UTC
      }
      delete rest.selectedDate;
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Create filter query, handling specialization filters
    const filterQuery = buildFilterQuery(
      {
        ...(filters.length > 0 ? { clinician_specialization: filters } : {}),
      },
      rest
    );

    if (selectedDate) {
      const selectedDay = dayNames[selectedDate.day()];
      filterQuery.day = selectedDay;
      filterQuery.start_date = { $lte: selectedDate.toDate() };
      filterQuery.end_date = { $gte: selectedDate.toDate() };
    }

    let schedules = await Schedule.find(filterQuery).select(
      SAFE_CLINICIAN_SCHEDULE_FIELDS_PATIENT
    );

    if (selectedDate) {
      schedules = schedules.filter((schedule) => {
        if (!schedule.start_date) {
          return false;
        }

        const scheduleStart = dayjs(schedule.start_date).startOf("day");
        const diffWeeks = selectedDate.diff(scheduleStart, "week");

        const isCorrectDay = dayNames[selectedDate.day()] === schedule.day;
        const duration = schedule.duration ?? Infinity;
        const isIncluded =
          diffWeeks >= 0 && diffWeeks < duration && isCorrectDay;

        return isIncluded;
      });
    }

    const totalRows = schedules.length;
    const totalPages = Math.ceil(totalRows / limit);
    const paginatedSchedules = schedules.slice(offset, offset + limit);

    res.status(200).json({
      data: paginatedSchedules,
      offset,
      limit,
      total_rows: totalRows,
      total_pages: totalPages,
      current_page: page,
    });
  } catch (error) {
    console.error("Error fetching clinician appointments:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while fetching clinician appointments";

    res.status(500).json({
      error: "Failed to get clinician appointments",
      message: errorMessage,
    });
  }
};
