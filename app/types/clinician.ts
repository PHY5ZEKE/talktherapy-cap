export interface CLINICIAN_SCHEDULE {
  clinician_id: string;
  clinician_name: string;
  clinician_specialization: string;
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  start_time: string;
  end_time: string;
  frequency: string;
  duration?: number;
  start_date: string;
  status: "Booked" | "Available" | "Pending";
  details: {
    patient_id: string | null;
    patient_name: string | null;
  };
  created_at?: Date;
  updated_at?: Date;
}
