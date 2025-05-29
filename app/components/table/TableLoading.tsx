import {
  Table,
  TableCell,
  TableContainer,
  TableRow,
  TableBody,
  Stack,
  Skeleton,
} from "@mui/material";

export default function TableLoading({ rowHeader }: { rowHeader: string[] }) {
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={rowHeader.length}>
              <Stack spacing={2}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width="100%"
                    height={24}
                  />
                ))}
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
