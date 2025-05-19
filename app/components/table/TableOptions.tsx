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

import { useState, useMemo } from "react";

type TableOptionsProps<T extends Record<string, unknown>> = {
  dataList: T[];
  rowHeader: string[];
  actions?: string[];
  filters?: string[];
};

// TODO: This will have to be refactored when fetching data from the server
// Response from server must have offset and limit in this format:
// data: array of objects
// offset: number
// limit: number
// total_rows: number
// total_pages: number
// ! This must be handled in the server response
// ! and not in the client side

export default function TableOptions<T extends Record<string, unknown>>({
  dataList,
  rowHeader,
  actions,
  filters,
}: TableOptionsProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (newFilters: string[]) => {
    setSelectedFilters(newFilters);
    setPage(0);
  };

  const resetFilters = () => {
    setSelectedFilters([]);
    setPage(0);
  };

  // data based on selected filters
  const filteredRows = useMemo(() => {
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

  const visibleRows = useMemo(
    () =>
      [...filteredRows].slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
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
            {visibleRows.map((data, index) => (
              <TableRow key={`row-${index}`}>
                {Object.values(data).map((value, cellIndex) => (
                  <TableCell key={`cell-${index}-${cellIndex}`}>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        count={filteredRows.length}
        component="div"
        page={page}
        rowsPerPageOptions={[5, 10]}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}
