import type { Route } from "./+types/login";
import { Box } from "@mui/material";
import Login from "modules/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "Login", content: "Welcome to TalkTherapy" },
  ];
}

export default function RootRoute() {
  return (
    // <Box component={"main"} sx={{ padding: 2 }}>
    <Login />
    // </Box>
  );
}
