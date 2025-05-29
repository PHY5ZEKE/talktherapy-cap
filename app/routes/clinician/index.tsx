import type { Route } from "./+types/index";

import ClinicianDashboard from "modules/clinician/";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "Dashboard", content: "View your dashboard" },
  ];
}

export default function ClinicianDashboardPage() {
  return <ClinicianDashboard />;
}
