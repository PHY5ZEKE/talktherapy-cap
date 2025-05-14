import { Outlet } from "react-router";

import { alpha, Box, Stack } from "@mui/material";

import { SideMenu } from "components/sidemenu";
import { Navbar } from "components/navbar";

import { useCookie } from "providers/CookieProvider";
import navlist from "config/navlist";
import type { NAV_LIST, USER_TOKEN } from "types/providers";

export default function PrivateLayout() {
  const { token } = useCookie();

  const user: USER_TOKEN = {
    name: token?.name || "",
    role: token?.role || "default",
    email: token?.email || "",
  };

  const list: NAV_LIST = navlist[user.role];

  return (
    <>
      <Box
        component={"main"}
        sx={{
          display: "flex",
        }}
      >
        <SideMenu user={user} list={list} />
        <Navbar user={user} list={list} />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
              <Outlet />
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
