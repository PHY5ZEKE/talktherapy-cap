import { Grid } from "@mui/material";

import PatientAppointmentList from "./PatientAppointmentList";
import PatientFavoriteList from "./PatientFavoriteList";

export default function index() {
  return (
    <Grid container spacing={2}>
      <PatientAppointmentList />
      <PatientFavoriteList />
    </Grid>
  );
}
