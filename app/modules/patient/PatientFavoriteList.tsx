import { Container } from "components/card";

import { sampleFavorites } from "config/sample";
import TablePagination from "~/components/table/TableOptions";

export default function PatientFavoriteList() {
  return (
    <Container size={{ xs: 12, lg: 4 }} title="Favorites">
      <TablePagination
        dataList={sampleFavorites}
        rowHeader={["Name", "Specialty", "Category", "Actions"]}
        actions={["Remove"]}
        filters={[]}
      />
    </Container>
  );
}
