import { useState } from "react";
import { Stack, Button } from "@mui/material";

import type { VIEW_ADMIN } from "types/account";
import { ModalAdminDetails, ModalArchive } from "components/modal";

export default function TableActions({
  data,
}: {
  data: Record<string, string>;
}) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  return (
    <Stack direction="row" spacing={2}>
      <Button
        onClick={() => setViewDialogOpen(true)}
        variant="contained"
        color="primary"
      >
        View
      </Button>
      <Button
        onClick={() => setArchiveDialogOpen(true)}
        variant="contained"
        color="primary"
      >
        Archive
      </Button>

      <ModalAdminDetails
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        data={data}
      />
      <ModalArchive
        open={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        name={data.firstName + " " + data.lastName}
      />
    </Stack>
  );
}
