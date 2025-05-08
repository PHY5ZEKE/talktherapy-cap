import { Box, Stack, Typography } from "@mui/material";

export default function SideUser() {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 4,
        maxWidth: 450,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack spacing={2} sx={{ padding: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            TalkTherapy
          </Typography>
          <Typography variant="body1" fontWeight={400}>
            Speech service in your hands.
          </Typography>
          <Typography variant="body2" fontWeight={400}>
            Skilled doctors, personalized exercises and feedback system.
            All-in-one go with TalkTherapy!
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
