import theme from "~/config/theme";
import { Outlet } from "react-router";
import { Stack } from "@mui/material";
import { SideUser } from "components/sidecontent";

export default function SignupLayout() {
  return (
    <Stack
      direction="column"
      component="main"
      sx={[
        {
          justifyContent: "center",
          height: "calc((1 - var(--template-frame-height, 0)) * 100%)",
          minHeight: "100vh",
          backgroundImage:
            "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
          backgroundRepeat: "no-repeat",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
          }),
        },
      ]}
    >
      <Stack
        direction={{ xs: "column-reverse", md: "row" }}
        sx={{
          justifyContent: "center",
          gap: { xs: 6, sm: 12 },
          p: 2,
          mx: "auto",
        }}
      >
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          sx={{
            height: { sm: "100%", md: "100vh" },
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 6, sm: 12 },
            p: { xs: 2, sm: 4 },
            m: "auto",
          }}
        >
          <SideUser />

          <Outlet />
        </Stack>
      </Stack>
    </Stack>
  );
}
