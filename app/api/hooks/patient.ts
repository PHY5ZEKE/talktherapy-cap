import { http } from "utils/http";
import type { PATIENT } from "types/account";

import queryString from "query-string";

export const signupPatient = async (data: PATIENT) => {
  const response = await http("POST", "/api/signup/patient", { data });
  return response;
};

export const useGetAllAppointments = async (
  page?: number,
  limit?: number,
  filters?: string[]
) => {
  const response = await http(
    "GET",
    `/api/patient/appointments?page=${page}&limit=${limit}&filters=${filters?.join(
      ","
    )}`
  );
  return response;
};

export const getClinicianSchedules = async (
  page?: number,
  limit?: number,
  selectedDate?: string | null,
  filters?: string[] | null
) => {
  const queryParams: Record<string, any> = {
    page,
    limit,
    selectedDate: selectedDate ? selectedDate : undefined,
    filters: filters && filters.length > 0 ? filters : undefined,
  };

  const query = queryString.stringify(queryParams, {
    skipEmptyString: true,
    skipNull: true,
    arrayFormat: "comma",
  });

  const response = await http("GET", `/api/patient/schedule?${query}`);

  return response;
};
