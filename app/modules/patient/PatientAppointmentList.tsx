import { Container } from "components/card";

import { APPOINTMENT_FILTERS } from "config/filters";

import TablePagination from "components/table/TableOptions";
import useAppointments from "./useAppointments";
import { Skeleton } from "@mui/material";

export default function PatientAppointmentList() {
  const { isLoading, error, appointments } = useAppointments();
  return (
    <>
      <Container size={{ sm: 12, lg: 8 }} title="Appointments">
        {isLoading ? (
          <Skeleton variant="rectangular" width={"100%"} height={24} />
        ) : (
          <TablePagination
            dataList={appointments}
            rowHeader={["Date", "Clinician", "Status", "Actions"]}
            actions={["Join", "Cancel"]}
            filters={APPOINTMENT_FILTERS}
          />
        )}
      </Container>
    </>
  );
}
