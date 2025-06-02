import {
  Box,
  Grid,
  Button,
  FormControl,
  FormLabel,
  Typography,
  MenuItem,
} from "@mui/material";
import { InputField } from "components/form";
import { Controller, useForm } from "react-hook-form";
import { CustomContainer } from "components/card";
import type { CLINICIAN_SCHEDULE } from "types/clinician";
import { SCHEDULE_DAY_OPTIONS } from "config/filters";

import useCreateSchedule from "./useCreateSchedule";

export default function CreateSchedule() {
  const { isLoading, createSchedule } = useCreateSchedule();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CLINICIAN_SCHEDULE>({
    defaultValues: {
      day: "Monday",
      start_time: "",
      end_time: "",
      start_date: "",
      end_date: "",
    },
  });

  const onSubmit = async (data: CLINICIAN_SCHEDULE) => {
    await createSchedule(data);
    reset();
  };

  return (
    <Grid container spacing={2}>
      <Box
        component="form"
        sx={{ width: "100%" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <CustomContainer size={{ xs: 12, md: 12, lg: 10 }} title="Add Schedule">
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 600,
              width: "100%",
            }}
          >
            Your Schedule
          </Typography>

          <FormControl>
            <FormLabel>Day</FormLabel>
            <Controller
              name="day"
              control={control}
              rules={{ required: "Day is required" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  select
                  error={!!errors.day}
                  helperText={errors.day?.message}
                >
                  {SCHEDULE_DAY_OPTIONS.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </InputField>
              )}
            />
          </FormControl>
          {/* START TIME */}
          <FormControl>
            <FormLabel>Start Time</FormLabel>
            <Controller
              name="start_time"
              control={control}
              rules={{ required: "Start time is required" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="time"
                  error={!!errors.start_time}
                  helperText={errors.start_time?.message}
                />
              )}
            />
          </FormControl>

          {/* END TIME */}
          <FormControl>
            <FormLabel>End Time</FormLabel>
            <Controller
              name="end_time"
              control={control}
              rules={{ required: "End time is required" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="time"
                  error={!!errors.end_time}
                  helperText={errors.end_time?.message}
                />
              )}
            />
          </FormControl>

          {/* START DATE */}
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Controller
              name="start_date"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="date"
                  error={!!errors.start_date}
                  helperText={errors.start_date?.message}
                />
              )}
            />
          </FormControl>

          {/* END DATE */}
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Controller
              name="end_date"
              control={control}
              rules={{ required: "End date is required" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  type="date"
                  error={!!errors.end_date}
                  helperText={errors.end_date?.message}
                />
              )}
            />
          </FormControl>

          <Button variant="contained" type="submit" disabled={isLoading}>
            Create
          </Button>
        </CustomContainer>
      </Box>
    </Grid>
  );
}
