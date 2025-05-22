import { Box, Button, Grid } from "@mui/material";
import { Link } from "react-router";
import { Container } from "components/card";

export default function index() {
  return (
    <Grid container spacing={2}>
      <Container size={{ lg: 12 }} title="Clinicians">
        <Box sx={{ display: "flex", gap: 2 }}>
          <Link to="/superadmin/create/admin">
            <Button variant="contained" color="primary">
              Add Admin
            </Button>
          </Link>
          <Link to="/superadmin/create/clinician">
            <Button variant="contained" color="primary">
              Add Clinician
            </Button>
          </Link>
        </Box>
      </Container>
    </Grid>
  );
}
