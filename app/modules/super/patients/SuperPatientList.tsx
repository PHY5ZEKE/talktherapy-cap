import { Container } from "components/card";

import TablePagination from "components/table/TableOptions";
import usePatients from "./usePatients";

import { PATIENT_FILTERS } from "config/filters";

import { Alert } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

export default function SuperPatientList() {
  const { isLoading, error, patients, page, limit, filters, handleQuery } =
    usePatients();

  return (
    <Container size={{ lg: 12 }} title="Patients">
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
        dataList={patients?.data ?? []}
        rowHeader={[
          "First",
          "Middle",
          "Last",
          "Email",
          "Mobile Number",
          "Diagnosis",
          "Account Status",
          "Actions",
        ]}
        actions={["View", "Archive"]}
        filters={PATIENT_FILTERS}
        activeFilters={filters}
        onFilterChange={(newFilters) => {
          handleQuery(0, limit, newFilters);
        }}
        totalRows={patients?.total_rows ?? 0}
        onPageChange={handleQuery}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </Container>
  );
}
