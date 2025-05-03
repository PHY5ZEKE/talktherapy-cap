import { Container, Box, Typography, Button } from "@mui/material";

export default function LandingHero() {
  return (
    <Container maxWidth="lg" sx={{ padding: 4, marginBottom: 2 }}>
      <Box>
        <Typography
          component="h1"
          variant="h2"
          fontWeight={700}
          sx={{ marginBottom: 2 }}
        >
          TalkTherapy
        </Typography>
        <Typography variant="h4" fontWeight={500} sx={{ marginBottom: 2 }}>
          Speech service in your hands.
        </Typography>
        <Typography variant="body1" fontWeight={400}>
          Skilled doctors, personalized exercises and feedback system.
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          All in one go with TalkTherapy!
        </Typography>
        <Button
          variant="outlined"
          size="large"
          sx={{ marginRight: 2, borderRadius: 5 }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
}
