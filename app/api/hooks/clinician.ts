import { http } from "utils/http";
import type { CLINICIAN } from "types/account";
import type { CLINICIAN_SCHEDULE } from "types/clinician";

export const signupClinician = async (data: CLINICIAN) => {
  const response = await http("POST", "/api/signup/clinician", data);
  return response;
};

export const createSchedule = async (data: CLINICIAN_SCHEDULE) => {
  const response = await http("POST", "/api/clinician/create/schedule", data);
  return response;
};
