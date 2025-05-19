import { Container } from "components/card";

import { APPOINTMENT_FILTERS } from "config/filters";

import TablePagination from "components/table/TableOptions";
import useAppointments from "./useAppointments";

import { Alert } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

export default function PatientAppointmentList() {
  const { isLoading, error, appointments, page, limit, filters, handleQuery } =
    useAppointments();

  return (
    <Container size={{ sm: 12, lg: 8 }} title="Appointments">
      {/* TODO: Add error component and logic */}
      {error && (
        <Alert
          icon={<ErrorOutlineRounded fontSize="inherit" />}
          severity="error"
        >
          {error}
        </Alert>
      )}
      <TablePagination
        dataList={appointments?.data ?? []}
        rowHeader={["Date", "Clinician", "Status", "Actions"]}
        actions={["Join", "Cancel"]}
        filters={APPOINTMENT_FILTERS}
        activeFilters={filters}
        onFilterChange={(newFilters) => {
          handleQuery(0, limit, newFilters);
        }}
        totalRows={appointments?.total_rows ?? 0}
        onPageChange={handleQuery}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </Container>
  );
}
