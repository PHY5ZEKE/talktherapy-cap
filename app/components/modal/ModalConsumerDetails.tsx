import {
  Typography,
  Box,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import {
  EmailRounded,
  PhoneRounded,
  MedicalInformationRounded,
} from "@mui/icons-material";

import { ChipAccountStatus } from "components/chip";

import type { DialogConsumer } from "types/actions";

export default function ModalAdminDetails({
  open,
  onClose,
  data,
}: DialogConsumer) {
  const { firstName, middleName, lastName, email, mobile, accountStatus } =
    data;
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const userCategory = data.diagnosis ? data.diagnosis : data.specialization;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="h2">
          User Details
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
            {fullName
              .split(" ")
              .map((name) => name[0].toUpperCase())
              .join("")}
          </Avatar>
          <Stack>
            <Typography variant="body1">{fullName}</Typography>
            <Typography variant="body2" color="textSecondary">
              {data._id}
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ mt: 2, fontWeight: 500 }}
          >
            Personal Details
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <EmailRounded color="action" />
              <Typography variant="body1">{email}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <PhoneRounded color="action" />
              <Typography variant="body1">{mobile}</Typography>
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ mt: 2, fontWeight: 500 }}
          >
            Medical Details
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MedicalInformationRounded color="action" />
              <Typography variant="body1">{userCategory}</Typography>
            </Stack>
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ mt: 2, fontWeight: 500 }}
          >
            Account Status
          </Typography>
          <ChipAccountStatus status={accountStatus} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
