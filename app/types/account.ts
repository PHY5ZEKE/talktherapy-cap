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
  consent: string;
};

export type ADMIN = Pick<
  USER,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "password"
  | "confPassword"
  | "mobile"
  | "address"
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
  | "birthday"
  | "address"
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

export type USER_TYPE = ADMIN | CLINICIAN | PATIENT;
