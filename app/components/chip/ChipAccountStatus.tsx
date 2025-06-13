import { Chip } from "@mui/material";

export default function ChipAccountStatus({ status }: { status: string }) {
  // Map status to appropriate color and style
  const getChipProps = () => {
    switch (status.toLowerCase()) {
      case "active":
        return { color: "success", variant: "filled" };
      case "pending":
        return { color: "warning", variant: "outlined" };
      case "suspended":
        return { color: "error", variant: "filled" };
      case "inactive":
        return { color: "default", variant: "outlined" };
      default:
        return { color: "default", variant: "outlined" };
    }
  };

  const { color, variant } = getChipProps();

  return (
    <Chip
      label={status}
      color={color as "success" | "warning" | "error" | "default"}
      variant={variant as "filled" | "outlined"}
      size="small"
      sx={{
        fontWeight: "medium",
        textTransform: "capitalize",
      }}
    />
  );
}
