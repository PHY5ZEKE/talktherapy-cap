import { Box, Typography, Stack, Skeleton } from "@mui/material";
import { CustomContainer } from "components/card";

type GradientColor = "green" | "red" | "blue";

const RoundedIcon = ({ color }: { color: GradientColor }) => {
  const gradientList = {
    green:
      "radial-gradient(circle,rgb(42, 155, 70) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%);",
    red: "radial-gradient(circle,rgba(255, 82, 82, 1) 0%, rgba(255, 138, 101, 1) 50%, rgba(255, 205, 86, 1) 100%);",
    blue: "radial-gradient(circle,rgba(66, 165, 245, 1) 0%, rgba(129, 212, 250, 1) 50%, rgba(255, 255, 255, 1) 100%);",
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: gradientList[color],
        borderRadius: "50%",
        width: 24,
        color: "white",
        height: 24,
      }}
    ></Box>
  );
};

export default function CardStats({
  title,
  value,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  color: "green" | "red" | "blue";
  isLoading: boolean;
}) {
  return (
    <CustomContainer size={{ xs: 12, md: 12, lg: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <RoundedIcon color={color} />
        <Typography gutterBottom variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {isLoading ? (
          <Skeleton
            variant="text"
            width={100}
            height={40}
            sx={{ marginX: "auto" }}
          />
        ) : (
          <Typography variant="h5" sx={{ marginX: "auto" }}>
            {value}
          </Typography>
        )}
        <Typography variant="caption" sx={{ marginX: "auto" }}>
          something here
        </Typography>
      </Box>
    </CustomContainer>
  );
}
