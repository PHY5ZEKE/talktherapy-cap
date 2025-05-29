import type { Route } from "./+types/schedule";

import CreateSchedule from "modules/clinician/create/CreateSchedule";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Schedule" },
    {
      name: "Create Schedule",
      content: "Create a new schedule for a clinician",
    },
  ];
}

export default function CreateSchedulePage() {
  return <CreateSchedule />;
}
