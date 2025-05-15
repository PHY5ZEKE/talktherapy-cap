import { Outlet } from "react-router";

import { alpha, Box, Container, Stack, Typography } from "@mui/material";

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
            <Container
              maxWidth={false}
              disableGutters
              sx={{ margin: 0, padding: 0 }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, my: 2, backgroundColor: "red" }}
              >
                Untitled
                {/* {document?.title || "Untitled"} */}
              </Typography>
              <Outlet />
            </Container>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
