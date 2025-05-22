import { CustomContainer } from "components/card";

import TablePagination from "components/table/TableOptions";
import useAdmins from "./useAdmins";

import { PATIENT_FILTERS } from "config/filters";

import { Alert } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

export default function SuperAdminList() {
  const { isLoading, error, admins, page, limit, filters, handleQuery } =
    useAdmins();

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
        dataList={admins?.data ?? []}
        rowHeader={[
          "First",
          "Middle",
          "Last",
          "Email",
          "Mobile Number",
          "Account Status",
          "Actions",
        ]}
        actions={["View", "Archive"]}
        filters={[]}
        activeFilters={filters}
        onFilterChange={(newFilters) => {
          handleQuery(0, limit, newFilters);
        }}
        totalRows={admins?.total_rows ?? 0}
        onPageChange={handleQuery}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </CustomContainer>
  );
}
