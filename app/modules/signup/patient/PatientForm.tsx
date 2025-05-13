import { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";

import type { PATIENT } from "types/account";

import PersonalInfoStep from "./PersonalInfoStep";
import AccountDetailsStep from "./AccountDetailsStep";
import MedicalInfoStep from "./MedicalInfoStep";

import { useSignup } from "./useSignup";

export default function PatientForm() {
  const { signup, loading } = useSignup();

  const [activeStep, setActiveStep] = useState(0);
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<PATIENT>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      mobile: "",
      birthday: "",
      email: "",
      password: "",
      confPassword: "",
      diagnosis: "",
      consent: false,
    },
  });

  const handleNext = async () => {
    const fields = getFieldsForStep(activeStep);
    const isValid = await trigger(fields);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getFieldsForStep = (step: number): (keyof PATIENT)[] => {
    switch (step) {
      case 0:
        return ["firstName", "lastName", "mobile", "birthday"];
      case 1:
        return ["email", "password", "confPassword"];
      case 2:
        return ["diagnosis", "consent"];
      default:
        return [];
    }
  };

  const onSubmit = async (data: PATIENT) => {
    await signup(data);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PersonalInfoStep control={control} errors={errors} />;
      case 1:
        return <AccountDetailsStep control={control} errors={errors} />;
      case 2:
        return <MedicalInfoStep control={control} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step key={0}>
          <StepLabel>{0}</StepLabel>
        </Step>
        <Step key={1}>
          <StepLabel>{0}</StepLabel>
        </Step>
        <Step key={2}>
          <StepLabel>{0}</StepLabel>
        </Step>
      </Stepper>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        {getStepContent(activeStep)}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          {activeStep === 2 ? (
            <Button type="submit" disabled={loading}>
              Submit
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
