import { http } from "utils/http";

// GET HOOKS
export const getAllPatients = async (
  page?: number,
  limit?: number,
  filters?: string[]
) => {
  const response = await http(
    "GET",
    `/api/super/patients?page=${page}&limit=${limit}&filters=${filters?.join(
      ","
    )}`
  );
  return response;
};

export const getAllAdmins = async (
  page?: number,
  limit?: number,
  filters?: string[]
) => {
  const response = await http(
    "GET",
    `/api/super/admins?page=${page}&limit=${limit}&filters=${filters?.join(
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
    `/api/super/clinicians?page=${page}&limit=${limit}&filters=${filters?.join(
      ","
    )}`
  );
  return response;
};

export const getRolesCount = async () => {
  const response = await http("GET", "/api/super/roles-count");
  return response;
};

// POST HOOKS
export const createAdmin = async (data: any) => {
  const response = await http("POST", "/api/super/create/admin", data);
  return response;
};
