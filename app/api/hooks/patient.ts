import { http } from "utils/http";
import type { PATIENT } from "types/account";

export const signupPatient = async (data: PATIENT) => {
  const response = await http("POST", "/api/signup/patient", data);
  return response;
};

export const useGetAppointments = async () => {
  const response = await http("GET", "/api/patient/appointments");
  return response;
};
