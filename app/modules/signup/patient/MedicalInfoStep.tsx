import { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Tooltip,
} from "@mui/material";
import { InputField } from "components/form";
import { Controller } from "react-hook-form";

import type { Control, FieldErrors } from "react-hook-form";
import type { PATIENT } from "types/account";
import PatientConsent from "./PatientConsent";

interface StepProps {
  control: Control<PATIENT>;
  errors: FieldErrors<PATIENT>;
}

const diagnoses = [
  { value: "Autism Spectrum Disorder", label: "Autism Spectrum Disorder" },
  {
    value: "Attention-Deficit Hyperactivity Disorder",
    label: "Attention-Deficit Hyperactivity Disorder",
  },
  { value: "Global Developmental Delay", label: "GDD" },
  { value: "Cerebral Palsy", label: "Cerebral Palsy" },
  { value: "Down Syndrome", label: "Down Syndrome" },
  { value: "Hearing Impairment", label: "Hearing Impairment" },
  { value: "Cleft Lip and/or Palate", label: "Cleft Lip and/or Palate" },
  { value: "Stroke", label: "Stroke" },
  { value: "Stuttering", label: "Stuttering" },
  { value: "Aphasia", label: "Aphasia" },
  { value: "Others", label: "Others" },
];

const MedicalInfoStep = ({ control, errors }: StepProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <FormControl fullWidth>
      <FormLabel>Diagnosis</FormLabel>
      <Controller
        name="diagnosis"
        control={control}
        defaultValue=""
        rules={{
          required: "Please select a diagnosis",
        }}
        render={({ field }) => (
          <InputField
            {...field}
            select
            error={!!errors.diagnosis}
            helperText={errors.diagnosis?.message}
          >
            {diagnoses.map((diagnosis) => (
              <MenuItem key={diagnosis.value} value={diagnosis.value}>
                {diagnosis.label}
              </MenuItem>
            ))}
          </InputField>
        )}
      />
    </FormControl>

    <FormControl fullWidth>
      <FormControlLabel
        control={
          <Controller
            name="consent"
            control={control}
            rules={{ required: "You must provide consent" }}
            render={({ field }) => {
              const [open, setOpen] = useState(false);
              const handleClose = () => {
                setOpen(false);
              };

              return (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Tooltip title="Click 'View Terms and Conditions' to provide consent">
                      <span>
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={!field.value && !open}
                        />
                      </span>
                    </Tooltip>

                    <Typography
                      onClick={() => setOpen(true)}
                      sx={{ cursor: "pointer" }}
                    >
                      View Terms and Conditions
                    </Typography>
                  </Box>
                  <PatientConsent
                    open={open}
                    handleClose={handleClose}
                    handleConsent={() => {
                      field.onChange(true);
                      handleClose();
                    }}
                  />
                </>
              );
            }}
          />
        }
        label=""
      />
      {errors.consent && (
        <Typography color="error" variant="caption">
          {errors.consent.message}
        </Typography>
      )}
    </FormControl>
  </Box>
);

export default MedicalInfoStep;
