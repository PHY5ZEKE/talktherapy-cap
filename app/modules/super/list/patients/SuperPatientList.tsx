import { CustomContainer } from "components/card";

import { TableOptions } from "components/table";
import usePatients from "./usePatients";

import { PATIENT_FILTERS } from "config/filters";

export default function SuperPatientList() {
  const { isLoading, error, patients, page, limit, filters, handleQuery } =
    usePatients();

  return (
    <CustomContainer size={{ lg: 12 }} title="Patients">
      <TableOptions
        error={error}
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
    </CustomContainer>
  );
}
