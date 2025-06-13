import type { Route } from "../+types";
import PatientAppointments from "modules/patient/list/appointments/";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Appointments" },
    { name: "Appointments", content: "List of Available Appointments" },
  ];
}

export default function index() {
  return <PatientAppointments />;
}
