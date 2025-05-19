import {
  Avatar,
  Box,
  Divider,
  Drawer as MuiDrawer,
  Stack,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { drawerClasses } from "@mui/material/Drawer";
import { LogoutRounded } from "@mui/icons-material";

import MenuContent from "./MenuContent";
import { useLogout } from "utils/logout";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Drawer
      variant="permanent"
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
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          TalkTherapy
        </Typography>
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
          <MenuContent isLoading={isLoading} list={list} />
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {isLoading ? (
          <Skeleton variant="circular" width={24} height={24} />
        ) : (
          <Avatar
            sizes="small"
            alt="Riley Carter"
            src="https://mui.com/static/images/avatar/1.jpg"
            sx={{ width: 36, height: 36 }}
          />
        )}
        <Box sx={{ mr: "auto" }}>
          {isLoading ? (
            <Skeleton variant="text" width={100} height={24} />
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: "16px" }}
              >
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user.email}
              </Typography>
            </>
          )}
        </Box>
        <Button variant="text" disabled={isLoading} onClick={handleLogout}>
          <LogoutRounded />
        </Button>
      </Stack>
    </Drawer>
  );
}
