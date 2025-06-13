import { Grid } from "@mui/material";

import ClinicianAppointments from "./ClinicianAppointments";
import PatientAppointments from "./PatientAppointments";

export default function index() {
  return (
    <Grid container spacing={2}>
      <ClinicianAppointments />
    </Grid>
  );
}
