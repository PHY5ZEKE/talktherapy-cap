import type { Route } from "./+types";

import { Box } from "@mui/material";
import SignUp from "modules/signup";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TalkTherapy" },
    { name: "Patient Signup", content: "Welcome to Patient Signup" },
  ];
}

export default function SignupRoute() {
  return (
    <Box component={"main"} sx={{ padding: 2 }}>
      <SignUp />
    </Box>
  );
}
