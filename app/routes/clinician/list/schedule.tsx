import type { Route } from "../+types";
import ClinicianScheduleList from "modules/clinician/list/ClinicianScheduleList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Schedule" },
    { name: "Schedule", content: "View all schedules" },
  ];
}

export default function schedule() {
  return <ClinicianScheduleList />;
}
