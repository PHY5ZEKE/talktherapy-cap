import { Box, FormControl, FormLabel, MenuItem } from "@mui/material";
import { InputField } from "components/form";
import { Controller } from "react-hook-form";

import type { Control, FieldErrors } from "react-hook-form";
import type { CLINICIAN } from "types/account";

import { SPECIALIZATION_OPTIONS } from "config/filters";

interface StepProps {
  control: Control<CLINICIAN>;
  errors: FieldErrors<CLINICIAN>;
}

const PersonalInfoStep = ({ control, errors }: StepProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <FormControl>
      <FormLabel>First Name</FormLabel>
      <Controller
        name="firstName"
        control={control}
        rules={{
          required: "First name is required",
          validate: (value) =>
            value.trim() === value || "Spaces at start/end are not allowed",
        }}
        render={({ field }) => (
          <InputField
            {...field}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
        )}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Middle Name</FormLabel>
      <Controller
        name="middleName"
        control={control}
        rules={{
          pattern: {
            value: /^[A-Za-z]*$/,
            message:
              "Middle name can only contain letters with no spaces or special characters",
          },
        }}
        render={({ field }) => (
          <InputField
            {...field}
            error={!!errors.middleName}
            helperText={errors.middleName?.message}
          />
        )}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Last Name</FormLabel>
      <Controller
        name="lastName"
        control={control}
        rules={{
          required: "First name is required",
          validate: (value) =>
            value.trim() === value || "Spaces at start/end are not allowed",
        }}
        render={({ field }) => (
          <InputField
            {...field}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        )}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Mobile Number</FormLabel>
      <Controller
        name="mobile"
        control={control}
        rules={{
          required: "Mobile number is required",
          pattern: {
            value: /^[0-9]{11}$/,
            message: "Invalid mobile number - must be eleven digits",
          },
        }}
        render={({ field }) => (
          <InputField
            {...field}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
          />
        )}
      />
    </FormControl>

    <FormControl fullWidth>
      <FormLabel>Specialization</FormLabel>
      <Controller
        name="specialization"
        control={control}
        defaultValue=""
        rules={{
          required: "Please select a specialization",
        }}
        render={({ field }) => (
          <InputField
            {...field}
            select
            error={!!errors.specialization}
            helperText={errors.specialization?.message}
          >
            {SPECIALIZATION_OPTIONS.map((specialization) => (
              <MenuItem key={specialization.value} value={specialization.value}>
                {specialization.label}
              </MenuItem>
            ))}
          </InputField>
        )}
      />
    </FormControl>
  </Box>
);

export default PersonalInfoStep;
