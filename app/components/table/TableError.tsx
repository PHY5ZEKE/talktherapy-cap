import {
  Table,
  TableCell,
  TableContainer,
  TableRow,
  TableBody,
  Stack,
  Tab,
} from "@mui/material";

import { ErrorOutlineRounded } from "@mui/icons-material";

export default function TableError({
  error,
  rowHeader,
}: {
  error: string | null;
  rowHeader: string[];
}) {
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={rowHeader.length}>
              <Stack spacing={2} alignItems="center">
                <Tab
                  icon={<ErrorOutlineRounded />}
                  label={error}
                  sx={{ color: "error.main" }}
                />
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
