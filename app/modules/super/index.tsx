import { Grid } from "@mui/material";
import { CardStats } from "components/card";

export default function index() {
  return (
    <Grid container spacing={2}>
      <CardStats title="Total Admin" value={0} color="blue" />
      <CardStats title="Total Clinicians" value={0} color="red" />
      <CardStats title="Total Patients" value={0} color="green" />
    </Grid>
  );
}
