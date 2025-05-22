import { http } from "utils/http";
import type { ADMIN } from "types/account";

// POST HOOKS
export const signupAdmin = async (data: ADMIN) => {
  const response = await http("POST", "/api/signup/admin", data);
  return response;
};

export const createClinician = async (data: any) => {
  const response = await http("POST", "/api/admin/create/clinician", data);
  return response;
};

// GET HOOKS
export const getAllPatients = async (
  page?: number,
  limit?: number,
  filters?: string[]
) => {
  const response = await http(
    "GET",
    `/api/admin/patients?page=${page}&limit=${limit}&filters=${filters?.join(
      ","
    )}`
  );
  return response;
};

export const getAllClinicians = async (
  page?: number,
  limit?: number,
  filters?: string[]
) => {
  const response = await http(
    "GET",
    `/api/admin/clinicians?page=${page}&limit=${limit}&filters=${filters?.join(
      ","
    )}`
  );
  return response;
};
