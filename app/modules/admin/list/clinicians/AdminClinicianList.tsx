import { CustomContainer } from "components/card";

import { TableOptions } from "components/table";
import useClinicians from "./useClinicians";
import TableActions from "./TableActions";
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
      <TableOptions
        error={error}
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
        actions={(data) => <TableActions data={data} />}
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
