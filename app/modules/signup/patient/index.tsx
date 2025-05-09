import { SignUpContainer } from "components/auth-form";
import { Button, Typography } from "@mui/material";
import { Link } from "react-router";

import PatientForm from "./PatientForm";

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
        Patient Registration
      </Typography>
      <PatientForm />
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
