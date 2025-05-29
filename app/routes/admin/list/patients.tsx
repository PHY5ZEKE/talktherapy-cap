import type { Route } from "./+types/patients";

import PatientList from "modules/admin/list/patients";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patients" },
    { name: "Patients", content: "View all patients" },
  ];
}

export default function patients() {
  return <PatientList />;
}
