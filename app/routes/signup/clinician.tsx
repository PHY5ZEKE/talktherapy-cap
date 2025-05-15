import type { Route } from "./+types";
import ClinicianForm from "modules/signup/clinician";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TalkTherapy" },
    { name: "Clinician Signup", content: "Welcome to Clinician Signup" },
  ];
}

export default function clinician() {
  return <ClinicianForm />;
}
