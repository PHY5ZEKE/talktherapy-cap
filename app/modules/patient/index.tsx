import { Grid } from "@mui/material";
export default function index() {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ backgroundColor: "red" }}>
        <div>1</div>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ backgroundColor: "blue" }}>
        <div>2</div>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ backgroundColor: "green" }}>
        <div>3</div>
      </Grid>
    </Grid>
  );
}
