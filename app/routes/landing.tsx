import type { Route } from "./+types/landing";
import { Box } from "@mui/material";
import Landing from "modules/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TalkTherapy" },
    { name: "TalkTherapy Landing", content: "Welcome to TalkTherapy" },
  ];
}

export default function RootRoute() {
  return (
    <Box component={"main"} sx={{ padding: 2 }}>
      <Landing />
    </Box>
  );
}
