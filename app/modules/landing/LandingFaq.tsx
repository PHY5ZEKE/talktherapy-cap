import { Box, Container, Typography } from "@mui/material";
export default function LandingFaq() {
  return (
    <Container maxWidth="lg" sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
          FAQ
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          We prioritize your health by offering tailored services in speech
          therapy, online appointments, and teleconferencing consultations. Our
          highly qualified clinicians are here to guide you in choosing the best
          treatment options to meet your individual health needs. Let us help
          you find the right path to recovery.
        </Typography>

        <Faq />
      </Box>
    </Container>
  );
}

const Faq = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
        FAQ
      </Typography>
      <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
        We prioritize your health by offering tailored services in speech
        therapy, online appointments, and teleconferencing consultations. Our
        highly qualified clinicians are here to guide you in choosing the best
        treatment options to meet your individual health needs. Let us help you
        find the right path to recovery.
      </Typography>
    </Box>
  );
};
