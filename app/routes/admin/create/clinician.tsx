import type { Route } from "./+types/clinician";
import CreateClinician from "modules/admin/create/CreateClinician";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Clinician" },
    { name: "Create Clinician", content: "Create a new clinician account" },
  ];
}

export default function clinician() {
  return <CreateClinician />;
}
