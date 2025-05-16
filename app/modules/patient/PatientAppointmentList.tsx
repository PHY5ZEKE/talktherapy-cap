import { Container } from "components/card";

import { sampleAppointments } from "config/sample";
import { APPOINTMENT_FILTERS } from "config/filters";

import TablePagination from "~/components/table/TableOptions";

export default function PatientAppointmentList() {
  return (
    <>
      <Container size={{ sm: 12, lg: 8 }} title="Appointments">
        <TablePagination
          dataList={sampleAppointments}
          rowHeader={["Date", "Clinician", "Status", "Actions"]}
          actions={["Join", "Cancel"]}
          filters={APPOINTMENT_FILTERS}
        />
      </Container>
    </>
  );
}
