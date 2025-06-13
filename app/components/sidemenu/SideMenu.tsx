import {
  Avatar,
  Box,
  Divider,
  Drawer as MuiDrawer,
  Stack,
  Typography,
  Button,
  Skeleton,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { drawerClasses } from "@mui/material/Drawer";
import {
  LogoutRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
} from "@mui/icons-material";

import MenuContent from "./SideMenuContent";
import { useLogout } from "utils/logout";
import { useState } from "react";

const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 72;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? expandedDrawerWidth : collapsedDrawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: open ? expandedDrawerWidth : collapsedDrawerWidth,
    boxSizing: "border-box",
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

export default function SideMenu({
  user,
  list,
  isLoading,
}: {
  user: { name: string; role: string; email: string };
  list: { text: string; icon: React.ReactNode }[];
  isLoading: boolean;
}) {
  const { logout } = useLogout();
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: open ? "space-between" : "center",
          alignItems: "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            TalkTherapy
          </Typography>
        )}
        <IconButton onClick={toggleDrawer} size="small">
          {open ? <ChevronLeftRounded /> : <ChevronRightRounded />}
        </IconButton>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width={210}
            height={20}
            sx={{ mx: "auto", mt: 2 }}
          />
        ) : (
          <MenuContent isLoading={isLoading} list={list} collapsed={!open} />
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: open ? 2 : 1,
          gap: 1,
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {isLoading ? (
          <Skeleton variant="circular" width={24} height={24} />
        ) : open ? (
          <>
            <Avatar
              sizes="small"
              alt="Riley Carter"
              src="https://mui.com/static/images/avatar/1.jpg"
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ mr: "auto" }}>
              <Box
                sx={{ width: 100, display: "flex", flexDirection: "column" }}
              >
                <Typography
                  variant="body2"
                  noWrap={true}
                  sx={{ fontWeight: 500, lineHeight: "16px" }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap={true}
                  sx={{ color: "text.secondary" }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Logout" placement="top">
              <Button
                variant="text"
                disabled={isLoading}
                onClick={handleLogout}
              >
                <LogoutRounded />
              </Button>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              disabled={isLoading}
              onClick={handleLogout}
              size="small"
            >
              <LogoutRounded />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Drawer>
  );
}
