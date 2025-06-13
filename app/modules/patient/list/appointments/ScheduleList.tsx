import { useEffect } from "react";
import { CustomContainer } from "components/card";

import { TablePatientSchedule } from "components/table";
import { useSchedule } from "./useSchedule";
import { PATIENT_FILTERS } from "config/filters";
import { Alert } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

type ScheduleListProps = {
  selectedDate: string | null;
};

export default function ScheduleList({ selectedDate }: ScheduleListProps) {
  const { isLoading, error, schedules, page, limit, filters, handleQuery } =
    useSchedule();

  useEffect(() => {
    handleQuery(0, limit, selectedDate, filters);
  }, [selectedDate, filters]);

  return (
    <CustomContainer size={{ lg: 12 }} title="Schedule">
      {error && (
        <Alert
          icon={<ErrorOutlineRounded fontSize="inherit" />}
          severity="error"
        >
          {error}
        </Alert>
      )}
      <TablePatientSchedule
        error={error}
        dataList={schedules?.data ?? []}
        rowHeader={[
          "Date",
          "Time",
          "Clinician",
          "Specialization",
          "Status",
          "Actions",
        ]}
        filters={PATIENT_FILTERS}
        actions={["Book", "View"]}
        activeFilters={filters}
        onFilterChange={(newFilters) => {
          handleQuery(0, limit, selectedDate, newFilters);
        }}
        selectedDate={selectedDate}
        totalRows={schedules?.total_rows ?? 0}
        onPageChange={(newPage, newLimit, newSelectedDate, newFilters) => {
          handleQuery(
            newPage,
            newLimit,
            newSelectedDate ?? selectedDate,
            newFilters ?? filters
          );
        }}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </CustomContainer>
  );
}
