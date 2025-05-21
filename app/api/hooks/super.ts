import { http } from "utils/http";

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
