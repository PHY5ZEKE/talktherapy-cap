import type { Route } from "./+types/patient";
import PatientSign from "modules/signup/patient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registration" },
    { name: "Registration", content: "Welcome to Registration" },
  ];
}
export default function PatientSignup() {
  return <PatientSign />;
}
