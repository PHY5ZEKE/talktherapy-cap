import { CustomContainer } from "components/card";

import { TableOptions } from "components/table";
import TableActions from "./TableActions";
import useAdmins from "./useAdmins";

import type { VIEW_ADMIN } from "types/account";
export default function SuperAdminList() {
  const { isLoading, error, admins, page, limit, filters, handleQuery } =
    useAdmins();

  return (
    <CustomContainer size={{ lg: 12 }} title="Admins">
      <TableOptions
        error={error}
        dataList={admins?.data ?? []}
        rowHeader={[
          "First",
          "Middle",
          "Last",
          "Email",
          "Mobile Number",
          "Account Status",
          "Actions",
        ]}
        actions={(rowData) => (
          <TableActions data={rowData as Record<VIEW_ADMIN, string>} />
        )}
        filters={[]}
        activeFilters={filters}
        onFilterChange={(newFilters) => {
          handleQuery(0, limit, newFilters);
        }}
        totalRows={admins?.total_rows ?? 0}
        onPageChange={handleQuery}
        page={page}
        rowsPerPage={limit}
        isLoading={isLoading}
      />
    </CustomContainer>
  );
}
