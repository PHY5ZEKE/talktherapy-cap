// This contains fields that are whitelisted for the API

const SAFE_PATIENT_FIELDS = {
  firstName: 1,
  middleName: 1,
  lastName: 1,
  email: 1,
  mobile: 1,
  diagnosis: 1,
  accountStatus: 1,
};

const SAFE_ADMIN_FIELDS = {
  firstName: 1,
  middleName: 1,
  lastName: 1,
  email: 1,
  mobile: 1,
  accountStatus: 1,
};

const SAFE_CLINICIAN_FIELDS = {
  firstName: 1,
  middleName: 1,
  lastName: 1,
  email: 1,
  mobile: 1,
  specialization: 1,
  accountStatus: 1,
};

// VIEWING AS CLINICIAN ACCOUNT
const SAFE_CLINICIAN_SCHEDULE_FIELDS = {
  day: 1,
  start_time: 1,
  end_time: 1,
  start_date: 1,
  end_date: 1,
  status: 1,
  details: {
    patient_name: 1,
  },
  frequency: 1,
};

export {
  SAFE_PATIENT_FIELDS,
  SAFE_ADMIN_FIELDS,
  SAFE_CLINICIAN_FIELDS,
  SAFE_CLINICIAN_SCHEDULE_FIELDS,
};
