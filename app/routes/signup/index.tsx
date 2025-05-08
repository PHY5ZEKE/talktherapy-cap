import { Box } from "@mui/material";
import SignUp from "modules/signup";

export default function SignupRoute() {
  return (
    <Box component={"main"} sx={{ padding: 2 }}>
      <SignUp />
    </Box>
  );
}
