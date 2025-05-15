import { useState } from "react";

import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Pagination,
  Stack,
} from "@mui/material";

import { Container } from "components/card";
import { MultiSelect } from "components/select";

import type { APPOINTMENT_STATUS } from "types/appointment";

import { sampleAppointments } from "~/config/sample";

const APPOINTMENT_STATUS: APPOINTMENT_STATUS[] = [
  "ACCEPTED",
  "PENDING",
  "REJECTED",
  "CANCELLED",
  "RESCHEDULED",
  "COMPLETED",
];

// Number of appointments to show per page
const ITEMS_PER_PAGE = 5;

export default function PatientAppointmentList() {
  const [dateFilters, setDateFilters] = useState<APPOINTMENT_STATUS[]>([]);

  //   TODO: Componentize
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sampleAppointments.length / ITEMS_PER_PAGE);

  const currentAppointments = sampleAppointments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <>
      <Container title="Appointments">
        <MultiSelect
          placeholder="Appointment Status"
          options={APPOINTMENT_STATUS}
          filters={dateFilters}
          onChange={setDateFilters}
        />

        <Box
          sx={{
            maxHeight: { xs: 400, md: 600 },
            overflowY: "auto",
          }}
        >
          {currentAppointments.map((appointment, index) => (
            <Card
              key={index}
              sx={{
                backgroundColor: "background.default",
                marginTop: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  padding: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0 }}>
                    {appointment.date}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0 }}>
                    Session with: {appointment.name}
                  </Typography>
                </Box>

                <Chip
                  label={appointment.status}
                  variant="outlined"
                  color={
                    appointment.status === "COMPLETED"
                      ? "success"
                      : appointment.status === "CANCELLED"
                      ? "error"
                      : "default"
                  }
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" color="primary">
                    Join
                  </Button>
                  <Button variant="outlined" color="primary">
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Pagination component */}
        <Stack spacing={2} sx={{ mt: 3, mb: 2, alignItems: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Container>
    </>
  );
}
