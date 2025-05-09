import { Box, FormControl, FormLabel } from "@mui/material";
import { InputField } from "components/form";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";

import type { PATIENT } from "types/account";

interface StepProps {
  control: Control<PATIENT>;
  errors: FieldErrors<PATIENT>;
}

const PersonalInfoStep = ({ control, errors }: StepProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <FormControl>
      <FormLabel>First Name</FormLabel>
      <Controller
        name="firstName"
        control={control}
        rules={{ required: "First name is required" }}
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
        render={({ field }) => <InputField {...field} />}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Last Name</FormLabel>
      <Controller
        name="lastName"
        control={control}
        rules={{ required: "Last name is required" }}
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
        rules={{ required: "Mobile number is required" }}
        render={({ field }) => (
          <InputField
            {...field}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
          />
        )}
      />
    </FormControl>

    <FormControl>
      <FormLabel>Birthday</FormLabel>
      <Controller
        name="birthday"
        control={control}
        rules={{ required: "Birthday is required" }}
        render={({ field }) => (
          <InputField
            {...field}
            type="date"
            error={!!errors.birthday}
            helperText={errors.birthday?.message}
            sx={{
              "& .MuiOutlinedInput-root": {},
            }}
          />
        )}
      />
    </FormControl>
  </Box>
);

export default PersonalInfoStep;
