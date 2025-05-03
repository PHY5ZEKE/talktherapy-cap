import type { LOGIN_PAYLOAD } from "types/credentials";

import { Card, SignInContainer } from "components/login";
import {
  Box,
  Typography,
  Button,
  Alert,
  FormControl,
  FormLabel,
} from "@mui/material";

import { InputField } from "components/form";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { ErrorOutlineRounded } from "@mui/icons-material";

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

  const onSubmit: SubmitHandler<LOGIN_PAYLOAD> = (data: LOGIN_PAYLOAD) => {
    console.log(data);
    reset();
  };

  return (
    <SignInContainer
      direction="column"
      justifyContent="space-between"
      maxWidth="xs"
    >
      <Card variant="outlined">
        <Alert
          icon={<ErrorOutlineRounded fontSize="inherit" />}
          severity="error"
        >
          There was an error processing your request.
        </Alert>

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
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 1,
          }}
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
            <Button variant="contained" color="primary" fullWidth type="submit">
              Login
            </Button>
          </Box>
        </Box>

        <Typography sx={{ textAlign: "center" }}>
          Forgot your password?
        </Typography>
        <Typography sx={{ textAlign: "center" }}>
          Don't have an account? Sign up
        </Typography>
      </Card>
    </SignInContainer>
  );
}
