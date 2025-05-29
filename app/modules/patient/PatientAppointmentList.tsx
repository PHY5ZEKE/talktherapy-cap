import { CustomContainer } from "components/card";

import { APPOINTMENT_FILTERS } from "config/filters";

import { TableOptions } from "components/table";
import useAppointments from "./useAppointments";

export default function PatientAppointmentList() {
  const { isLoading, error, appointments, page, limit, filters, handleQuery } =
    useAppointments();

  return (
    <CustomContainer size={{ sm: 12, lg: 8 }} title="Appointments">
      <TableOptions
        error={error}
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
    </CustomContainer>
  );
}
