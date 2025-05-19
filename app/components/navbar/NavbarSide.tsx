import {
  Drawer,
  Stack,
  Typography,
  Avatar,
  Divider,
  Button,
  Skeleton,
} from "@mui/material";
import { LogoutRounded as LogoutRoundedIcon } from "@mui/icons-material";
import { drawerClasses } from "@mui/material/Drawer";

import { MenuContent } from "components/sidemenu";
import type { USER_TOKEN, NAV_LIST } from "types/providers";
import { logout } from "api/hooks/auth";

export default function NavbarSide({
  open,
  toggleDrawer,
  user,
  list,
  isLoading,
}: {
  open: boolean;
  toggleDrawer: (open: boolean) => () => void;
  user: USER_TOKEN;
  list: NAV_LIST;
  isLoading: boolean;
}) {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "70dvw",
          height: "100%",
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", flexGrow: 1, p: 1 }}
          >
            {isLoading ? (
              <>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={100} height={24} />
              </>
            ) : (
              <>
                <Avatar
                  sizes="small"
                  alt={user.name}
                  src="https://mui.com/static/images/avatar/7.jpg"
                  sx={{ width: 24, height: 24 }}
                />
                <Typography component="p" variant="h6">
                  {user.name}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent isLoading={isLoading} list={list} />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            disabled={isLoading}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
