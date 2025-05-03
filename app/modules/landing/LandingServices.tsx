import { Box, Container, Grid, Typography } from "@mui/material";

export default function LandingServices() {
  return (
    <Container maxWidth="lg" sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
          Services
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          We prioritize your health by offering tailored services in speech
          therapy, online appointments, and teleconferencing consultations. Our
          highly qualified clinicians are here to guide you in choosing the best
          treatment options to meet your individual health needs. Let us help
          you find the right path to recovery.
        </Typography>

        <Services />
      </Box>
    </Container>
  );
}

const Services = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
          Speech Therapy
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          TalkTherapy is a web application designed to make speech therapy
          accessible and affordable for individuals with speech and
          communication challenges, especially in underserved areas of the
          Philippines. By connecting patients with licensed therapists through
          online consultations, the platform eliminates the need for travel and
          physical resources. It also uses advanced technologies like facial,
          lip, and voice recognition to provide personalized feedback and
          progress tracking.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
          Appointment
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          Scheduling speech therapy appointments has never been easier. With
          TalkTherapy, you can book sessions with speech-language pathologists
          at your convenience, all from the comfort of your home. Our
          user-friendly platform lets you select preferred day and time, and
          view therapist availability. TalkTherapy ensures a hassle-free
          process, so you can focus on improving your communication skills.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h3" fontWeight={700} sx={{ marginBottom: 2 }}>
          Teleconference
        </Typography>
        <Typography variant="body1" fontWeight={400} sx={{ marginBottom: 2 }}>
          TalkTherapy brings speech therapy right to your fingertips through
          secure and reliable teleconferencing. Our platform connects you with
          speech-language pathologists for live, one-on-one sessions,
          eliminating the need for long commutes or physical visits. Whether
          you're at home or on the go, you can access professional guidance and
          personalized exercises designed to meet your communication needs.
        </Typography>
      </Grid>
    </Grid>
  );
};
