import { http } from "utils/http";
import type { PATIENT } from "types/account";

export const signupPatient = async (data: PATIENT) => {
  const response = await http("POST", "/api/patient/register", data);
  return response;
};
