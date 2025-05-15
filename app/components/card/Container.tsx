import { Grid, Typography, Card } from "@mui/material";

export default function Container({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
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
