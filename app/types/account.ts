export type USER = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confPassword: string;
  mobile: string;
  birthday: string;
  address: string;
  specialization: string;
  diagnosis: string;
  consent: boolean;
};

export type SUPER_ADMIN = Pick<
  USER,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "password"
  | "confPassword"
  | "mobile"
>;

export type ADMIN = Pick<
  USER,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "password"
  | "confPassword"
  | "mobile"
>;

export type CLINICIAN = Pick<
  USER,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "password"
  | "confPassword"
  | "mobile"
  | "specialization"
>;

export type PATIENT = Pick<
  USER,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "password"
  | "confPassword"
  | "mobile"
  | "birthday"
  | "diagnosis"
  | "consent"
>;

// VIEWING FIELDS
export type VIEW_ADMIN =
  | "_id"
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "mobile"
  | "accountStatus";

export type USER_TYPE = ADMIN | CLINICIAN | PATIENT;
