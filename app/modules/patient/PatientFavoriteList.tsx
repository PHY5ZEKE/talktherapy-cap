import { CustomContainer } from "components/card";

import { sampleFavorites } from "config/sample";
import { TableOptions } from "components/table/";

export default function PatientFavoriteList() {
  return (
    <CustomContainer size={{ xs: 12, lg: 4 }} title="Favorites">
      <TableOptions
        isLoading={false}
        dataList={sampleFavorites}
        rowHeader={["Name", "Specialty", "Category", "Actions"]}
        actions={["Remove"]}
        filters={[]}
      />
    </CustomContainer>
  );
}
