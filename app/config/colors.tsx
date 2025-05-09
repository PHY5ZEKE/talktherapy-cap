import { blue, indigo, grey } from "@mui/material/colors";

// color palette
// primary: white to black
const primary = {
  50: "#f9f9f9",
  100: "#f3f3f3",
  200: "#eaeaea",
  300: "#dadada",
  400: "#b7b7b7",
  500: "#979797",
  600: "#6f6f6f",
  700: "#5b5b5b",
  800: "#3c3c3c",
  900: "#1c1c1c",
};

// secondard: light blue to blue
const secondary = {
  50: "#e2f2ff",
  100: "#b9ddff",
  200: "#87c9ff",
  300: "#4bb3ff",
  400: "#00a1ff",
  500: "#0090ff",
  600: "#0081ff",
  700: "#006dff",
  800: "#195aec",
  900: "#2935cc",
};

// primary color: blue
const gradientBlue = {
  top: secondary[700],
  bottom: secondary[700],
};

const disabled = {
  primary: primary[400],
  secondary: secondary[400],
};

const hover = {
  primary: primary[700],
  secondary: secondary[800],
};

export { gradientBlue, disabled, hover, primary, secondary };
