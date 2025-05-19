import { http } from "utils/http";

export const login = async (data: { email: string; password: string }) => {
  const response = await http("POST", "/api/auth/login", data);
  return response;
};

export const logout = async () => {
  const response = await http("POST", "/api/auth/logout");
  return response;
};
