import { styled, TextField } from "@mui/material";
import { grey } from "@mui/material/colors";

export const InputField = styled(TextField)(({ theme }) => ({
  "& fieldset": {
    borderRadius: 10,
    borderColor: grey[300],
    borderWidth: 1.5,
  },
  input: {
    background: grey[50],
    borderRadius: 10,
    height: 10,
  },
}));
