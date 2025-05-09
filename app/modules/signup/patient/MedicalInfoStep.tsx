import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { InputField } from "components/form";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";

import type { PATIENT } from "types/account";

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
        rules={{ required: "Please select a diagnosis" }}
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

    <FormControl>
      <FormControlLabel
        control={
          <Controller
            name="consent"
            control={control}
            rules={{ required: "You must provide consent" }}
            render={({ field }) => (
              <Checkbox {...field} checked={field.value} />
            )}
          />
        }
        label="I consent to the terms and conditions"
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
