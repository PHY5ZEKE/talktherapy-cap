import type { ThemeOptions } from "@mui/material/styles";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { hover, primary, secondary } from "./colors";

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: primary[900],
      contrastText: "#fafafa",
    },
    secondary: {
      main: secondary[500],
      contrastText: "#041420",
    },
    text: {
      primary: primary[900],
      secondary: primary[700],
      disabled: primary[500],
    },
    action: {
      active: primary[900],
      hover: primary[700],
      selected: primary[500],
      disabled: primary[400],
      disabledBackground: primary[200],
    },
    background: {
      default: "#fafafa",
    },
  },
  typography: {
    fontFamily: "Inter",
    fontSize: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#fafafa",
          color: primary[900],
        },
        "*": {
          transition: "all 0.2s ease-in-out",
        },
      },
    },
    // CUSTOM BUTTON
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 5,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: 1,
          },
        },
        outlined: {
          borderRadius: 5,
          backgroundColor: primary[50],
          boxShadow: "none",
          color: primary[600],
          "&:hover": {
            backgroundColor: secondary[800],
            borderColor: secondary[700],
            boxShadow: `0px 0px 6px 0px ${secondary[500]}`,
            color: secondary[50],
          },
        },
        text: {
          borderRadius: 5,
          background: "transparent",
          boxShadow: "none",
          "&:hover": {
            // animate underline
            textDecoration: "underline",
            textDecorationThickness: 2,
            textUnderlineOffset: 3,
            textDecorationColor: secondary[500],
            color: secondary[500],
          },
        },
      },
    },
    // CUSTOM ACCORDION
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        square: true,
      },
      styleOverrides: {
        root: {
          // text justify
          textAlign: "justify",
          backgroundColor: primary[50],
          borderRadius: 5,
          boxShadow: "none",
        },
      },
    },
    // CARD
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          backgroundColor: primary[50],
          borderRadius: 15,
          boxShadow: "none",
        },
      },
    },
  },
};

let theme = createTheme(themeOptions);
theme = responsiveFontSizes(theme);

export default theme;
