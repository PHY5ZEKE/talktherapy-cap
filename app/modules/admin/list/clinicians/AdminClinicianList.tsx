import { CustomContainer } from "components/card";

import TablePagination from "components/table/TableOptions";
import useClinicians from "./useClinicians";

import { PATIENT_FILTERS } from "config/filters";

import { Alert } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

export default function AdminClinicianList() {
  const { isLoading, error, clinicians, page, limit, filters, handleQuery } =
    useClinicians();

  return (
    <CustomContainer size={{ lg: 12 }} title="Admins">
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
        dataList={clinicians?.data ?? []}
        rowHeader={[
          "First",
          "Middle",
          "Last",
          "Email",
          "Mobile Number",
          "Specialization",
          "Account Status",
          "Actions",
        ]}
        actions={["View", "Archive"]}
        filters={PATIENT_FILTERS}
        activeFilters={filters}
        onFilterChange={(newFilters) => {
          handleQuery(0, limit, newFilters);
        }}
        totalRows={clinicians?.total_rows ?? 0}
        onPageChange={handleQuery}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </CustomContainer>
  );
}
