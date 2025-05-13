import { http } from "utils/http";
import type { ADMIN } from "types/account";

export const signupAdmin = async (data: ADMIN) => {
  const response = await http("POST", "/api/admin/register", data);
  return response;
};
