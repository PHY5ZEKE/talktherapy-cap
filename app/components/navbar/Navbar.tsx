import {
  AppBar,
  Toolbar as MuiToolbar,
  Stack,
  Typography,
  styled,
  Button,
} from "@mui/material";
import { tabsClasses } from "@mui/material/Tabs";
import { MenuRounded as MenuRoundedIcon } from "@mui/icons-material";
import { useState } from "react";

import NavbarSide from "./NavbarSide";
import { primary } from "config/colors";

import type { USER_TOKEN, NAV_LIST } from "types/providers";

const Toolbar = styled(MuiToolbar)({
  width: "100%",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  justifyContent: "center",
  gap: "12px",
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: "8px",
    p: "8px",
    pb: 0,
  },
});

const MenuButton = styled(Button)({
  borderRadius: 5,
  borderColor: primary[300],
  backgroundColor: "background.paper",
  borderWidth: 1,
  width: "32px",
  height: "32px",
  minWidth: "32px",
  padding: 5,
  "&:hover": {
    borderColor: "divider",
    backgroundColor: "background.paper",
  },
  // icon
  "& .MuiSvgIcon-root": {
    fontSize: 16,
    color: primary[800],
    "&:hover": {
      color: primary[50],
    },
  },
});

export default function Navbar({
  user,
  list,
  isLoading,
}: {
  user: USER_TOKEN;
  list: NAV_LIST;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: "auto", md: "none" },
        boxShadow: 0,
        bgcolor: "background.paper",
        backgroundImage: "none",
        borderBottom: "1px solid",
        borderColor: "divider",
        top: "var(--template-frame-height, 0px)",
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            flexGrow: 1,
            width: "100%",
            gap: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "center", mr: "auto" }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              TalkTherapy
            </Typography>
          </Stack>
          <MenuButton
            variant="outlined"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuRoundedIcon />
          </MenuButton>
          <NavbarSide
            open={open}
            toggleDrawer={toggleDrawer}
            user={user}
            list={list}
            isLoading={isLoading}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
