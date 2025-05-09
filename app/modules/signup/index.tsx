import {
  Stack,
  Typography,
  Card,
  CardContent,
  CardActions,
  Box,
  styled,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { CheckCircleRounded } from "@mui/icons-material";

import { primary, secondary } from "config/colors";
import { SolidButton } from "components/buttons";

import { Link } from "react-router";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  maxWidth: 400,
  width: "100%",
  borderColor: primary[400],
  borderWidth: 1.5,
  backgroundColor: primary[50],
  padding: 5,
  margin: theme.spacing(2),
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

const patientRoles = [
  "Access to personalized health information",
  "Ability to communicate with healthcare providers",
  "Ability to manage appointments",
  "Access to telehealth services",
];

const clinicianRoles = [
  "Access to patient health information",
  "Ability to communicate with patients",
  "Ability to manage appointments",
  "Access to telehealth services",
];

const adminRoles = [
  "Access to patient health information",
  "Ability to manage user accounts",
  "Ability to manage appointments",
  "Access to telehealth services",
];

const RenderRoles = ({ roles }: { roles: string[] }) => {
  return (
    <List disablePadding={true}>
      {roles.map((role, index) => (
        <ListItem
          sx={{ padding: 0, marginTop: 1, marginBottom: 1 }}
          key={index}
        >
          <ListItemButton
            dense={true}
            sx={{ padding: 0, "&:hover": { backgroundColor: "inherit" } }}
          >
            <ListItemIcon>
              <CheckCircleRounded />
            </ListItemIcon>
            <ListItemText primary={role} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default function index() {
  return (
    <Stack
      component="main"
      direction="column"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
        height: "calc((1 - var(--template-frame-height, 0)) * 100%)",
        minHeight: "100vh",
      }}
    >
      <Stack>
        <Typography
          component={"h1"}
          variant="h3"
          sx={{ textAlign: "center", fontWeight: 700 }}
        >
          Welcome to TalkTherapy
        </Typography>
        <Typography
          component={"h1"}
          variant="h4"
          sx={{ textAlign: "center" }}
          gutterBottom
        >
          Role Selection
        </Typography>
        <Typography
          component={"h1"}
          variant="body2"
          sx={{ textAlign: "center", marginBottom: 2 }}
        >
          Please select your role to proceed with the sign-up process.
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <StyledCard>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Patient
              </Typography>

              {/* list with icon */}
              <RenderRoles roles={patientRoles} />
            </CardContent>
            <CardActions>
              <SolidButton>
                <Link to="/signup/patient">Sign Up</Link>
              </SolidButton>
            </CardActions>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Clinician
              </Typography>

              {/* list with icon */}
              <RenderRoles roles={clinicianRoles} />
            </CardContent>
            <CardActions>
              <SolidButton>
                <Link to="/signup/clinician">Sign Up</Link>
              </SolidButton>
            </CardActions>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Admin
              </Typography>

              {/* list with icon */}
              <RenderRoles roles={adminRoles} />
            </CardContent>
            <CardActions>
              <SolidButton>
                <Link to="/signup/admin">Sign Up</Link>
              </SolidButton>
            </CardActions>
          </StyledCard>
        </Stack>
      </Stack>
    </Stack>
  );
}
