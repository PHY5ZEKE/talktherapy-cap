import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Stack,
  TablePagination,
  Button,
} from "@mui/material";

import { TableLoading, TableError } from "components/table";

import { useMemo } from "react";
import { formatTime } from "utils/time";

type TableClinicianScheduleOptions<T extends Record<string, unknown>> = {
  dataList: T[];
  rowHeader: string[];
  actions?: string[];
  selectedDate?: string | null;
  activeFilters?: string[];
  totalRows?: number;
  page?: number;
  rowsPerPage?: number;
  isLoading?: boolean;
  onPageChange?: (
    page: number,
    limit: number,
    selectedDate: string | null
  ) => void;
  error: string | null;
};

export default function TableClinicianSchedule<
  T extends Record<string, unknown>
>({
  dataList,
  rowHeader,
  actions,
  selectedDate,
  activeFilters = [],
  totalRows,
  page = 0,
  rowsPerPage = 10,
  isLoading = false,
  onPageChange,
  error = null,
}: TableClinicianScheduleOptions<T>) {
  const selectedFilters = activeFilters ?? [];

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage, rowsPerPage, selectedDate || null);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    if (onPageChange) {
      onPageChange(0, newLimit, selectedDate || null);
    }
  };

  // data based on selected filters
  const filteredRows: T[] = useMemo(() => {
    if (!Array.isArray(dataList)) return [];
    if (selectedFilters.length === 0) return dataList;

    return dataList.filter((row) => {
      const rowValues = Object.values(row).map((value) =>
        typeof value === "object" ? JSON.stringify(value) : String(value)
      );

      return rowValues.some((value) =>
        selectedFilters.some((filter) =>
          value.toLowerCase().includes(filter.toLowerCase())
        )
      );
    });
  }, [dataList, selectedFilters]);

  const visibleRows = filteredRows;

  // Loading state
  if (isLoading) {
    return <TableLoading rowHeader={rowHeader} />;
  }

  // Error state
  if (error) {
    return <TableError error={error} rowHeader={rowHeader} />;
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {rowHeader.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleRows.map((data, index) => (
              <TableRow key={index}>
                {/* Date (day) */}
                <TableCell>{String(data.day ?? "")}</TableCell>

                {/* Time */}
                <TableCell>
                  {`${formatTime(String(data.start_time ?? ""))} - ${formatTime(
                    String(data.end_time ?? "")
                  )}`}
                </TableCell>

                {/* Status */}
                <TableCell>{String(data.status ?? "")}</TableCell>

                {/* Patient */}
                <TableCell>
                  {typeof data.details === "object" && data.details
                    ? String(
                        (data.details as { patient_name?: string })
                          .patient_name || "Unassigned"
                      )
                    : "Unassigned"}
                </TableCell>

                {actions && actions.length > 0 && (
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={`action-${index}-${actionIndex}`}
                          variant="contained"
                          color="primary"
                          size="small"
                        >
                          {action}
                        </Button>
                      ))}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {typeof totalRows === "number" && totalRows > 0 && (
        <TablePagination
          count={totalRows}
          component="div"
          page={page}
          rowsPerPageOptions={[10]}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </>
  );
}
