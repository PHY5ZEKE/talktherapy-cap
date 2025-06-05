import type { Request, Response } from "express";
import type { AuthenticateRequest } from "types/response";

import { calculateEndDate } from "utils/date";
import { parseQueryParams, buildFilterQuery } from "utils/http";
import {
  SAFE_CLINICIAN_FIELDS,
  SAFE_CLINICIAN_SCHEDULE_FIELDS,
} from "config/whitelist";

import Schedule from "models/schedule";
import Clinician from "models/clinician";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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

    const { day, start_time, end_time, start_date, duration } = req.body;

    if (!day || !start_time || !end_time || !start_date || !duration) {
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
      duration,
      start_date: new Date(start_date),
      end_date: calculateEndDate(start_date, duration),
      status: "Available",
      details: { patient_id: null, patient_name: null },
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

export const getClinicianScheduleById = async (
  req: AuthenticateRequest,
  res: Response
) => {
  try {
    const { id } = req.user;
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

    const filterQuery = buildFilterQuery(
      {
        clinician_id: id,
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
      SAFE_CLINICIAN_SCHEDULE_FIELDS
    );

    if (selectedDate) {
      schedules = schedules.filter((schedule) => {
        if (!schedule.start_date || !schedule.frequency) {
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
    console.error("Error retrieving schedule:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while retrieving schedule";

    res.status(500).json({
      error: "Failed to retrieve schedule",
      message: errorMessage,
    });
  }
};
