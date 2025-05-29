import type { Route } from "./+types/clinicians";
import ClinicianList from "modules/admin/list/clinicians";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Clinicians" },
    { name: "Clinicians", content: "View all clinicians" },
  ];
}

export default function clinicians() {
  return <ClinicianList />;
}
