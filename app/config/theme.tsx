import type { ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#2790ff",
    },
    secondary: {
      main: "#272727",
    },
  },
  typography: {
    fontFamily: "Inter",
    fontSize: 14,
  },
};

const theme = createTheme(themeOptions);

export default theme;
