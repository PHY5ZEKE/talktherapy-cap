import { useState } from "react";
import { Box, Stepper, Step, StepLabel, Button } from "@mui/material";
import { useForm } from "react-hook-form";

import type { ADMIN } from "types/account";

import PersonalInfoStep from "./PersonalInfoStep";
import AccountDetailsStep from "./AccountDetailsStep";

export default function ClinicianForm() {
  const [activeStep, setActiveStep] = useState(0);
  const {
    control,
    handleSubmit,
    trigger,
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

  const handleNext = async () => {
    const currentStepFields = getFieldsForStep(activeStep);
    const isValid = await trigger(currentStepFields);
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getFieldsForStep = (step: number): (keyof ADMIN)[] => {
    switch (step) {
      case 0:
        return ["firstName", "lastName", "mobile"];
      case 1:
        return ["email", "password", "confPassword"];
      default:
        return [];
    }
  };

  const onSubmit = (data: ADMIN) => {
    console.log(data);
    // simulate
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PersonalInfoStep control={control} errors={errors} />;
      case 1:
        return <AccountDetailsStep control={control} errors={errors} />;
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
          {activeStep === 1 ? (
            <Button type="submit" variant="contained">
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
