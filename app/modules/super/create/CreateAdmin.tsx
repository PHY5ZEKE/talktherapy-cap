import {
  Grid,
  Button,
  FormControl,
  FormLabel,
  Typography,
} from "@mui/material";
import { InputField } from "components/form";
import { Controller, useForm } from "react-hook-form";
import { Container } from "components/card";

import type { ADMIN } from "types/account";
import { validatePassword } from "utils/validation";

export default function CreateAdmin() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ADMIN>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      confPassword: "",
      mobile: "",
    },
  });

  const onSubmit = (data: ADMIN) => {
    console.log(data);
  };

  return (
    <Grid container spacing={2}>
      <Container size={{ xs: 12, md: 12, lg: 10 }} title="Add Admin">
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 600,
            width: "100%",
          }}
        >
          Admin Registration
        </Typography>
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
            rules={{
              required: "Password is required",
              validate: (value) => validatePassword(value),
              onChange: (event) => {
                const value = event.target.value;
                if (value.length > 0) {
                  validatePassword(value);
                }
              },
            }}
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
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          Create
        </Button>
      </Container>
    </Grid>
  );
}
