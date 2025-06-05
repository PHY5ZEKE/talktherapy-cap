import { useEffect } from "react";
import { CustomContainer } from "components/card";

import { TableClinicianSchedule } from "components/table";
import { useClinicianSchedule } from "./useClinicianSchedule";

import { Alert } from "@mui/material";
import { ErrorOutlineRounded } from "@mui/icons-material";

type ScheduleListProps = {
  selectedDate: string | null;
};

export default function ScheduleList({ selectedDate }: ScheduleListProps) {
  const { isLoading, error, schedules, page, limit, handleQuery } =
    useClinicianSchedule();

  useEffect(() => {
    handleQuery(0, limit, selectedDate);
  }, [selectedDate]);

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
      <TableClinicianSchedule
        error={error}
        dataList={schedules?.data ?? []}
        rowHeader={["Date", "Time", "Status", "Patient", "Actions"]}
        actions={["View", "Cancel"]}
        selectedDate={selectedDate}
        totalRows={schedules?.total_rows ?? 0}
        onPageChange={handleQuery}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </CustomContainer>
  );
}
