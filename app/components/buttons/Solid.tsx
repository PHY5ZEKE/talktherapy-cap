import { Button, styled } from "@mui/material";
import { gradientBlue, disabled } from "config/colors";

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: `linear-gradient(180deg,${gradientBlue.top} 5%,${gradientBlue.bottom} 90%)`,
  borderRadius: 10,
  boxShadow: "none",
  color: "white",
  height: 48,
  padding: "0 30px",
  "&:hover": {
    border: 0,
    backgroundColor: disabled.indigo,
  },
  "&:disabled": {
    border: 0,
    backgroundColor: disabled.grey,
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
