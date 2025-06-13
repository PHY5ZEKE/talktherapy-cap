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
import { MultiSelect } from "components/select";

import { useMemo } from "react";

type TableOptionsProps<T extends Record<string, unknown>> = {
  dataList: T[];
  rowHeader: string[];
  actions?: (data: T) => React.ReactNode;
  filters?: string[];
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  totalRows?: number;
  page?: number;
  rowsPerPage?: number;
  isLoading?: boolean;
  onPageChange?: (page: number, limit: number, filters: string[]) => void;
  error: string | null;
};

export default function TableOptions<T extends Record<string, unknown>>({
  dataList,
  rowHeader,
  actions,
  filters,
  activeFilters = [],
  onFilterChange = () => {},
  totalRows,
  page = 0,
  rowsPerPage = 10,
  isLoading = false,
  onPageChange,
  error = null,
}: TableOptionsProps<T>) {
  const selectedFilters = activeFilters ?? [];

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage, rowsPerPage, selectedFilters);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    if (onPageChange) {
      onPageChange(0, newLimit, selectedFilters);
    }
  };

  const handleFilterChange = (newFilters: string[]) => {
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const resetFilters = () => {
    if (onFilterChange) {
      onFilterChange([]);
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
      {filters && filters.length > 0 && (
        <Stack direction="row" spacing={2} mb={2}>
          <MultiSelect
            placeholder="Filter"
            options={filters || []}
            filters={selectedFilters}
            onChange={handleFilterChange}
          />

          {selectedFilters.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={resetFilters}
              sx={{ height: "42px" }}
            >
              Reset
            </Button>
          )}
        </Stack>
      )}

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
              <TableRow key={`row-${index}`}>
                {Object.entries(data).map(([key, value], cellIndex) => (
                  <TableCell
                    key={`cell-${index}-${cellIndex}`}
                    sx={{ display: key === "_id" ? "none" : "table-cell" }}
                  >
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </TableCell>
                ))}

                {actions && (
                  <TableCell>
                    {actions(data)}{" "}
                    {/* This ensures each row gets its own data */}
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
