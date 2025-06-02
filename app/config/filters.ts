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

const SPECIALIZATION_OPTIONS = [
  { value: "Autism Spectrum Disorder", label: "Autism Spectrum Disorder" },
  {
    value: "Attention-Deficit Hyperactivity Disorder",
    label: "Attention-Deficit Hyperactivity Disorder",
  },
  { value: "Global Developmental Delay", label: "GDD" },
  { value: "Cerebral Palsy", label: "Cerebral Palsy" },
  { value: "Down Syndrome", label: "Down Syndrome" },
  { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Cleft Lip and/or Palate", label: "Cleft Lip and/or Palate" },
  { value: "Stroke", label: "Stroke" },
  { value: "Stuttering", label: "Stuttering" },
  { value: "Aphasia", label: "Aphasia" },
  { value: "Others", label: "Others" },
];

const SCHEDULE_DAY_OPTIONS = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

export {
  APPOINTMENT_FILTERS,
  PATIENT_FILTERS,
  SPECIALIZATION_OPTIONS,
  SCHEDULE_DAY_OPTIONS,
};
