import type { APPOINTMENT_STATUS } from "types/appointment";

const APPOINTMENT_FILTERS: APPOINTMENT_STATUS[] = [
  "ACCEPTED",
  "PENDING",
  "REJECTED",
  "CANCELLED",
  "RESCHEDULED",
  "COMPLETED",
];

const PATIENT_FILTERS = [
  "Autism Spectrum Disorder",
  "Attention-Deficit Hyperactivity Disorder",
  "Global Developmental Delay",
  "Cerebral Palsy",
  "Down Syndrome",
  "Hearing Impairment",
  "Cleft Lip and/or Palate",
  "Stroke",
  "Stuttering",
  "Aphasia",
  "Others",
];

export { APPOINTMENT_FILTERS, PATIENT_FILTERS };
