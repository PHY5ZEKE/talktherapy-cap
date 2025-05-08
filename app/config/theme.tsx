import type { ThemeOptions } from "@mui/material/styles";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { grey, blue, indigo } from "@mui/material/colors";
export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: blue["A700"],
      contrastText: "#fafafa",
    },
    secondary: {
      main: indigo["A400"],
      contrastText: "#041420",
    },
    text: {
      primary: grey[900],
      secondary: "rgba(4, 20, 32, 0.6)",
      disabled: "rgba(4, 20, 32, 0.38)",
    },
    background: {
      default: "#fafafa",
    },
  },
  typography: {
    fontFamily: "Inter",
    fontSize: 14,
  },
};

let theme = createTheme(themeOptions);
theme = responsiveFontSizes(theme);

export default theme;
