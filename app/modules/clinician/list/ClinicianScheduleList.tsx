import { useState } from "react";
import { Grid } from "@mui/material";
import dayjs from "dayjs";
import { StaticDatePicker } from "@mui/x-date-pickers";

import ScheduleList from "./ScheduleList";
export default function ClinicianScheduleList() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>();

  console.log(selectedDate);
  return (
    <Grid container spacing={2}>
      <div>
        <p>Date Picker</p>
        <StaticDatePicker
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          slotProps={{ actionBar: { actions: ["today", "clear"] } }}
        />
      </div>
      <div>
        <p>Schedule List</p>
        <ScheduleList
          selectedDate={selectedDate ? selectedDate.format("YYYY-MM-DD") : null}
        />
      </div>
      <div>Schedule Details</div>
    </Grid>
  );
}
