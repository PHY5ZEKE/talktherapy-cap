import type { Route } from "./+types/clinicians";
import ClinicianList from "modules/super/list/clinicians";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Clinicians" },
    { name: "Clinicians", content: "List of all clinicians" },
  ];
}

export default function clinicians() {
  return <ClinicianList />;
}
