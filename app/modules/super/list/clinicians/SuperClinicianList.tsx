import { CustomContainer } from "components/card";

import { TableOptions } from "components/table";
import TableActions from "./TableActions";

import useClinicians from "./useClinicians";

import { PATIENT_FILTERS } from "config/filters";

export default function SuperClinicianList() {
  const { isLoading, error, clinicians, page, limit, filters, handleQuery } =
    useClinicians();

  return (
    <CustomContainer size={{ lg: 12 }} title="Clinicians">
      <TableOptions
        dataList={clinicians?.data ?? []}
        error={error}
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
