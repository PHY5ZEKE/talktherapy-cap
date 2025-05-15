import { Grid } from "@mui/material";

import PatientAppointmentList from "./PatientAppointmentList";

export default function index() {
  return (
    <Grid container spacing={2}>
      <PatientAppointmentList />
    </Grid>
  );
}
