import {
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Tooltip,
} from "@mui/material";

import { Link, useLocation } from "react-router";

import { SettingsRounded } from "@mui/icons-material";
import type { NAV_LIST } from "types/providers";

export default function MenuContent({
  list,
  isLoading,
  collapsed = false,
}: {
  list: NAV_LIST;
  isLoading: boolean;
  collapsed?: boolean;
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
                <Tooltip title={collapsed ? item.text : ""} placement="right">
                  <ListItemButton
                    selected={location.pathname === (item.route || "/")}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? "center" : "initial",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? "auto" : 3,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={item.text} />}
                  </ListItemButton>
                </Tooltip>
              </Link>
            </ListItem>
          ))
        )}
      </List>
      <List dense>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={collapsed ? "Settings" : ""} placement="right">
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? "center" : "initial",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? "auto" : 3,
                  justifyContent: "center",
                }}
              >
                <SettingsRounded />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={"Settings"} />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Stack>
  );
}
