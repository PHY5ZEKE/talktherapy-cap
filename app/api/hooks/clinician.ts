import { http } from "utils/http";
import type { CLINICIAN } from "types/account";

export const signupClinician = async (data: CLINICIAN) => {
  const response = await http("POST", "/api/signup/clinician", data);
  return response;
};
