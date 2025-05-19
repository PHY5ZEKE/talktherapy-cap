import { useState } from "react";
import { Container } from "components/card";

import { APPOINTMENT_FILTERS } from "config/filters";

import TablePagination from "components/table/TableOptions";
import useAppointments from "./useAppointments";
import { Skeleton } from "@mui/material";

export default function PatientAppointmentList() {
  const { isLoading, error, appointments, getAppointments } = useAppointments();

  console.log(appointments);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<string[]>([]);

  const handlePageChange = async (
    newPage: number,
    newLimit: number = limit,
    newFilters: string[] = filters
  ) => {
    console.log({ newPage, newLimit, newFilters });
    setPage(newPage);
    setLimit(newLimit);
    setFilters(newFilters);
    await getAppointments(newPage + 1, newLimit, newFilters);
  };

  return (
    <Container size={{ sm: 12, lg: 8 }} title="Appointments">
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={24} />
      ) : (
        <TablePagination
          dataList={appointments.data}
          rowHeader={["Date", "Clinician", "Status", "Actions"]}
          actions={["Join", "Cancel"]}
          filters={APPOINTMENT_FILTERS}
          totalRows={appointments?.total_rows ?? 0}
          onPageChange={handlePageChange}
          page={page}
          rowsPerPage={limit}
        />
      )}
    </Container>
  );
}
