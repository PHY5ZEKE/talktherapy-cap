import type { Route } from "./+types";
import PatientDashboard from "modules/patient/";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "Dashboard", content: "Welcome to Patient Dashboard" },
  ];
}

export default function index() {
  return <PatientDashboard />;
}
