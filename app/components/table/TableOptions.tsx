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

import { MultiSelect } from "components/select";

import { useState, useEffect, useMemo } from "react";

type TableOptionsProps<T extends Record<string, unknown>> = {
  dataList: T[];
  rowHeader: string[];
  actions?: string[];
  filters?: string[];
  totalRows?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number, limit: number, filters: string[]) => void;
};

export default function TableOptions<T extends Record<string, unknown>>({
  dataList,
  rowHeader,
  actions,
  filters,
  totalRows,
  page: initialPage = 0,
  rowsPerPage: initialRowsPerPage = 10,
  onPageChange,
}: TableOptionsProps<T>) {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // From handleChangePage to resetFilters
  // refactor to update the state and call onPageChange

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
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
    setSelectedFilters(newFilters);
    if (onPageChange) {
      onPageChange(0, rowsPerPage, newFilters);
    }
  };

  const resetFilters = () => {
    setSelectedFilters([]);
    if (onPageChange) {
      onPageChange(0, rowsPerPage, []);
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

  const visibleRows: T[] = useMemo(
    () =>
      filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, filteredRows]
  );

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
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={rowHeader.length + (actions?.length ? 1 : 0)}
                  align="center"
                >
                  {dataList.length === 0
                    ? "No data available"
                    : "No matching records found"}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((data, index) => (
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
              ))
            )}
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
