import type { LOGIN_PAYLOAD } from "types/credentials";

import { SignInContainer } from "components/auth-form";
import {
  Box,
  Typography,
  Alert,
  FormControl,
  FormLabel,
  Button,
} from "@mui/material";

import { InputField } from "components/form";
import { Link } from "react-router";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { ErrorOutlineRounded } from "@mui/icons-material";
import { SolidButton } from "components/buttons";
import { useLogin } from "./useLogin";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LOGIN_PAYLOAD>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LOGIN_PAYLOAD> = async (
    data: LOGIN_PAYLOAD
  ) => {
    await login(data);
    reset();
  };

  const { login, isLoading, error } = useLogin();

  return (
    <SignInContainer>
      {error && (
        <Alert
          icon={<ErrorOutlineRounded fontSize="inherit" />}
          severity="error"
        >
          {error}
        </Alert>
      )}

      <Typography
        component="h1"
        variant="h4"
        sx={{
          fontWeight: 600,
          width: "100%",
          fontSize: "clamp(2rem, 10vw, 2.15rem)",
        }}
      >
        Login
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <InputField
            id="email"
            placeholder="your@email.com"
            variant="outlined"
            fullWidth
            margin="dense"
            defaultValue={""}
            {...register("email", {
              required: {
                value: true,
                message: "Please enter your email address.",
              },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address.",
              },
            })}
            error={!!errors.email}
            helperText={errors.email && errors.email.message}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password">Password</FormLabel>
          <InputField
            id="password"
            placeholder="******"
            variant="outlined"
            fullWidth
            margin="dense"
            defaultValue={""}
            type="password"
            {...register("password", {
              required: {
                value: true,
                message: "Please enter your password.",
              },
            })}
            error={!!errors.password}
            helperText={errors.password && errors.password.message}
          />
        </FormControl>

        <Box>
          <SolidButton disabled={isLoading}>Login</SolidButton>
        </Box>
      </Box>

      <Typography sx={{ textAlign: "center" }}>
        Forgot your password?
      </Typography>
      <Typography sx={{ textAlign: "center" }}>
        Don't have an account?{" "}
        <Button variant="text" sx={{ fontWeight: 700 }}>
          Sign up
        </Button>
      </Typography>
      <Button variant="text" sx={{ textAlign: "center" }}>
        <Link to="/">Go back</Link>
      </Button>
    </SignInContainer>
  );
}
