import { grey, blue, yellow } from "@mui/material/colors";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import {
  ForumRounded,
  CalendarMonthRounded,
  MedicalServicesRounded,
} from "@mui/icons-material";

const iconStyles = { fontSize: "2.25em", color: "white" };
const ServicesList = [
  {
    id: 1,
    icon: <ForumRounded sx={iconStyles} />,
    title: "Speech Therapy",
    description:
      "By connecting patients with licensed therapists through online consultations, the platform eliminates the need for travel and physical resources. It also uses advanced technologies like facial, lip, and voice recognition to provide personalized feedback and progress tracking.",
  },
  {
    id: 2,
    icon: <CalendarMonthRounded sx={iconStyles} />,
    title: "Appointment",
    description:
      "With TalkTherapy, you can book sessions with speech-language pathologists at your convenience, all from the comfort of your home. Our user-friendly platform lets you select preferred day and time, and view therapist availability.",
  },
  {
    id: 3,
    icon: <MedicalServicesRounded sx={iconStyles} />,
    title: "Teleconference",
    description:
      "Whether you're at home or on the go, you can access professional guidance and personalized exercises designed to meet your communication needs.",
  },
];

const ServiceBlock = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Grid
      size={{ xs: 12, md: 4 }}
      sx={{
        alignItems: "stretch",
        backgroundColor: "#424242",
        padding: 2,
        borderRadius: 6,
        borderColor: grey[700],
        borderWidth: 1,
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
          borderColor: grey[400],
          boxShadow: `0px 0px 6px 0px ${grey[700]}`,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: grey[900],
          width: 70,
          height: 70,
          borderRadius: 5,
          borderColor: grey[900],
          borderWidth: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            transform: "scale(1.02)",
            borderColor: grey[400],
            boxShadow: `0px 0px 6px 0px ${grey[700]}`,
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        component="h3"
        variant="h5"
        color="#fff"
        fontWeight={600}
        sx={{ marginTop: 2, marginBottom: 2 }}
      >
        {title}
      </Typography>
      <Typography
        color="#fff"
        variant="body1"
        fontWeight={400}
        sx={{ marginBottom: 2 }}
      >
        {description}
      </Typography>
    </Grid>
  );
};

export default function LandingServices() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        padding: 3,
        backgroundColor: grey[900],
        borderRadius: 10,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: grey[900],
              padding: 2,
              width: "min-content",
              borderRadius: 6,
              borderColor: grey[800],
              borderWidth: 1,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.02)",
                borderColor: grey[400],
                boxShadow: `0px 0px 6px 0px ${grey[700]}`,
              },
            }}
          >
            <Typography
              component="h2"
              variant="h4"
              fontWeight={600}
              color="#fff"
            >
              Services
            </Typography>
          </Box>
          <Typography
            variant="body1"
            color="#fff"
            fontWeight={400}
            textAlign={{ xs: "center", md: "right" }}
            sx={{ width: "auto" }}
          >
            We prioritize your health by offering tailored services in speech
            therapy, online appointments, and teleconferencing consultations.
            Let us help you find the right path to recovery.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {ServicesList.map((item) => (
            <ServiceBlock
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
