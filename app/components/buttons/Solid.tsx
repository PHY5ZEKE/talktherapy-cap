import { Button, styled } from "@mui/material";
import {
  gradientBlue,
  primary,
  secondary,
  hover,
  disabled,
} from "config/colors";

const CustomButton = styled(Button)(({ theme }) => ({
  // backgroundColor: `linear-gradient(180deg, ${gradientBlue.top} 0%, ${gradientBlue.bottom} 100%)`,
  borderRadius: 10,
  boxShadow: "none",
  color: "white",
  height: 48,
  padding: "0 30px",
  "&:hover": {
    borderColor: secondary[800],
    boxShadow: `0px 0px 6px 0px ${secondary[600]}`,
    backgroundColor: hover.secondary,
  },
  "&:disabled": {
    border: 0,
    backgroundColor: disabled.primary,
  },
}));

interface SolidButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function SolidButton({
  children,
  disabled = false,
  onClick,
  type = "submit",
}: SolidButtonProps) {
  return (
    <CustomButton
      disabled={disabled}
      variant="contained"
      fullWidth
      type={type}
      onClick={onClick}
    >
      {children}
    </CustomButton>
  );
}
