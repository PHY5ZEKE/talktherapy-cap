import {
  Typography,
  Stack,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import type { ActionDialogPropsArchive } from "types/actions";

export default function ModalArchive({
  open,
  onClose,
  name,
}: ActionDialogPropsArchive) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="h2">
          Archive User
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack direction="column" justifyContent="center">
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            You have selected <span style={{ fontWeight: "bold" }}>{name}</span>{" "}
            for archiving.
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Are you sure you want to archive this user?
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={() => {}} variant="outlined" color="primary">
          Archive
        </Button>
      </DialogActions>
    </Dialog>
  );
}
