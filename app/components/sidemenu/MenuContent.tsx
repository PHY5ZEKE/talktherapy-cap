import {
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from "@mui/material";

import { Link, useLocation } from "react-router";

import { SettingsRounded } from "@mui/icons-material";
import type { NAV_LIST } from "types/providers";

export default function MenuContent({
  list,
  isLoading,
}: {
  list: NAV_LIST;
  isLoading: boolean;
}) {
  const location = useLocation();
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {isLoading ? (
          <Skeleton variant="rectangular" width={210} height={20} />
        ) : (
          list.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <Link to={item.route || "/"} style={{ textDecoration: "none" }}>
                <ListItemButton
                  selected={location.pathname === (item.route || "/")}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))
        )}
      </List>
      <List dense>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton>
            <ListItemIcon>{<SettingsRounded />}</ListItemIcon>
            <ListItemText primary={"Settings"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Stack>
  );
}
