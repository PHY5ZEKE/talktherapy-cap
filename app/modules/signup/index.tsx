import {
  Stack,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { Link } from "react-router";
export default function index() {
  return (
    <Stack>
      <Typography variant="h1">Choose which role</Typography>
      <Stack direction="row" spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h2">Patient</Typography>
          </CardContent>
          <CardActions>
            <Link to="/signup/patient">
              <Button>Sign Up</Button>
            </Link>
          </CardActions>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h2">Clinician</Typography>
          </CardContent>
          <CardActions>
            <Link to="/signup/clinician">
              <Button>Sign Up</Button>
            </Link>
          </CardActions>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h2">Admin</Typography>
          </CardContent>
          <CardActions>
            <Link to="/signup/admin">
              <Button>Sign Up</Button>
            </Link>
          </CardActions>
        </Card>
      </Stack>
    </Stack>
  );
}
