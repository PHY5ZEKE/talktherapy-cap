import Landing from "modules/landing";
import { Box } from "@mui/material";
export default function index() {
  return (
    <Box component={"main"} sx={{ padding: 2 }}>
      <Landing />
    </Box>
  );
}
