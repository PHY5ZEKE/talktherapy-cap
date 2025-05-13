import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function PatientConsent({
  open,
  handleClose,
  handleConsent,
}: {
  open: boolean;
  handleClose: () => void;
  handleConsent: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Consent Form</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6">Evaluation & Therapy Sessions</Typography>
        <Typography variant="body1">1. Patient Contact</Typography>
        <Typography variant="body1">
          Administrators and clinicians will have access to the client’s contact
          details. If and when the client changes contact details, it must be
          reported to the assigned clinician immediately.
        </Typography>
        <Typography variant="body1">2. Patient Handling</Typography>
        <Typography variant="body1">
          That the assessment and intervention will be done by the clinicians
          registered in the website
        </Typography>

        <Typography variant="body1">3. In-session Documentation</Typography>
        <Typography variant="body1">
          That SOAP templates will be used to document the sessions. These will
          be recorded in text. The recordings will be used in teaching, learning
          activities, and research purposes.
        </Typography>

        <Typography variant="h6">
          Assessment (and other) Documentation
        </Typography>
        <Typography variant="body1">1. Purpose & Use</Typography>
        <Typography variant="body1">
          That documents pertaining to the course of assessment and treatment
          will be used for teaching, learning, and research purposes. Personal
          information obtained pertaining to the case will be held in strict
          confidentiality.
        </Typography>

        <Typography variant="body1">2. Data Storage</Typography>
        <Typography variant="body1">
          That the soft copy data of the client will be stored and can only be
          accessed by current authorized personnel in the website, Soft copy
          data will be stored in MongoDB. Data will be kept until they are
          active as current clients of the center.
        </Typography>

        <Typography variant="body1">3. Account Disposal</Typography>
        <Typography variant="body1">
          That once the client is no longer an active member, data and access to
          the website will be disposed of after 3 months of inactivity in the
          website
        </Typography>

        <Typography
          variant="body1"
          sx={{ textAlign: "center", mt: 4, fontWeight: "bold" }}
        >
          By ticking the checkbox, you agree to the terms and conditions of the
          usage of TalkTherapy.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            handleConsent();
          }}
        >
          I Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
}
