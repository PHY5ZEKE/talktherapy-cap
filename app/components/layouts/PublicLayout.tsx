import { Outlet } from "react-router";
import { Link } from "react-router";
import { Container, Box, Typography, Stack, Button } from "@mui/material";

const Navigation = () => {
  return (
    <Stack
      component={"nav"}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ padding: 2, boxShadow: 1 }}
    >
      <Box>
        <Typography fontWeight={700} variant="h6">
          TalkTherapy
        </Typography>
      </Box>

      <Box component="nav" sx={{ display: "flex", gap: 2 }}>
        <Button variant="text">
          <Link to="/login">Login</Link>
        </Button>
        <Button variant="text">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </Box>
    </Stack>
  );
};

const Footer = () => {
  return (
    <Stack
      component={"footer"}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ padding: 2, borderTop: 1, borderColor: "divider" }}
    >
      <Box>
        <Typography fontWeight={700} variant="h6">
          TalkTherapy
        </Typography>
      </Box>

      <Box component="nav" sx={{ display: "flex", gap: 2 }}>
        <Button variant="text">
          <Link to="/login">Login</Link>
        </Button>
        <Button variant="text">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </Box>
    </Stack>
  );
};

export default function PublicLayout() {
  return (
    <Container maxWidth={false} disableGutters sx={{ margin: 0, padding: 0 }}>
      <Navigation />
      <Outlet />
      <Footer />
    </Container>
  );
  ``;
}
