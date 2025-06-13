import { useState } from "react";
import { Grid } from "@mui/material";
import dayjs from "dayjs";
import { StaticDatePicker } from "@mui/x-date-pickers";

import ScheduleList from "./ScheduleList";
export default function ClinicianAppointments() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  return (
    <>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
        <StaticDatePicker
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          slotProps={{ actionBar: { actions: ["today", "clear"] } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
        <ScheduleList
          selectedDate={selectedDate ? selectedDate.format("YYYY-MM-DD") : null}
        />
      </Grid>
    </>
  );
}
