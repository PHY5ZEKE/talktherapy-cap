import { http } from "utils/http";
import type { CLINICIAN } from "types/account";
import type { CLINICIAN_SCHEDULE } from "types/clinician";

import queryString from "query-string";

export const signupClinician = async (data: CLINICIAN) => {
  const response = await http("POST", "/api/signup/clinician", {
    data,
  });
  return response;
};

export const createSchedule = async (data: CLINICIAN_SCHEDULE) => {
  const response = await http("POST", "/api/clinician/create/schedule", {
    data,
  });
  return response;
};

export const getClinicianScheduleById = async (
  page?: number,
  limit?: number,
  selectedDate?: string | null
) => {
  const queryParams: Record<string, any> = {
    page,
    limit,
    selectedDate: selectedDate ? selectedDate : undefined,
  };

  const query = queryString.stringify(queryParams, {
    skipEmptyString: true,
    skipNull: true,
    arrayFormat: "comma",
  });

  const response = await http("GET", `/api/clinician/schedule?${query}`);

  return response;
};
