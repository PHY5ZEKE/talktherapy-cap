import { Grid } from "@mui/material";
import { CardStats } from "components/card";

import useCount from "./useCount";

export default function index() {
  const { isLoading, error, count, getCount } = useCount();
  return (
    <Grid container spacing={2}>
      <CardStats
        isLoading={isLoading}
        title="Total Admin"
        value={count.admins}
        color="blue"
      />
      <CardStats
        isLoading={isLoading}
        title="Total Clinicians"
        value={count.clinicians}
        color="red"
      />
      <CardStats
        isLoading={isLoading}
        title="Total Patients"
        value={count.patients}
        color="green"
      />
    </Grid>
  );
}
