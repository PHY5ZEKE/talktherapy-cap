import type { ReactNode } from "react";

export type USER_ROLE =
  | "patient"
  | "clinician"
  | "admin"
  | "super-admin"
  | "default";

export type USER_TOKEN = {
  name: string;
  role: USER_ROLE;
  email: string;
};

export type NavItem = {
  text: string;
  icon: ReactNode;
};

export type NAV_LIST = NavItem[];
