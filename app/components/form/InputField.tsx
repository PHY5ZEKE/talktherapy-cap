import { styled, TextField } from "@mui/material";
import { primary } from "config/colors";

export const InputField = styled(TextField)(({ theme }) => ({
  "& fieldset": {
    borderRadius: 10,
    borderWidth: 1.5,
  },
  input: {
    borderRadius: 10,
    height: "min-content",
  },
}));
