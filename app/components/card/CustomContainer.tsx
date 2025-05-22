import { Grid, Typography, Card } from "@mui/material";

export default function CustomContainer({
  title,
  children,
  size = { xs: 12, sm: 6, md: 6, lg: 4 },
}: {
  title?: string;
  children: React.ReactNode;
  size?: Partial<{ xs: number; sm: number; md: number; lg: number }>;
}) {
  return (
    <Grid size={size}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Card
        sx={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "16px",
        }}
      >
        {children}
      </Card>
    </Grid>
  );
}
