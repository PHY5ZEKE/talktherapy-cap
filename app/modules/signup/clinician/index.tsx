import { SignUpContainer } from "components/auth-form";
import { Typography } from "@mui/material";
import { Link } from "react-router";
import ClinicianForm from "./ClinicianForm";

export default function index() {
  return (
    <SignUpContainer>
      <Typography
        component="h1"
        variant="h4"
        sx={{
          fontWeight: 600,
          width: "100%",
        }}
      >
        Clinician Registration
      </Typography>
      <ClinicianForm />
      <Typography variant="body2" sx={{ textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ fontWeight: 600 }}>
          LOGIN
        </Link>
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center" }}>
        Back to{" "}
        <Link to="/" style={{ fontWeight: 600 }}>
          TALKTHERAPY
        </Link>
      </Typography>
    </SignUpContainer>
  );
}
