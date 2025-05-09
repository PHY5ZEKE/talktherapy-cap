import { Box, FormControl, FormLabel } from "@mui/material";
import { InputField } from "components/form";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";

import type { PATIENT } from "types/account";

interface StepProps {
  control: Control<PATIENT>;
  errors: FieldErrors<PATIENT>;
}

const AccountDetailsStep = ({ control, errors }: StepProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <FormControl>
      <FormLabel>Email</FormLabel>
      <Controller
        name="email"
        control={control}
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        }}
        render={({ field }) => (
          <InputField
            {...field}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Password</FormLabel>
      <Controller
        name="password"
        control={control}
        rules={{ required: "Password is required" }}
        render={({ field }) => (
          <InputField
            {...field}
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        )}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Confirm Password</FormLabel>
      <Controller
        name="confPassword"
        control={control}
        rules={{
          required: "Please confirm your password",
          validate: (value, formValues) =>
            value === formValues.password || "Passwords do not match",
        }}
        render={({ field }) => (
          <InputField
            {...field}
            type="password"
            error={!!errors.confPassword}
            helperText={errors.confPassword?.message}
          />
        )}
      />
    </FormControl>
  </Box>
);

export default AccountDetailsStep;
