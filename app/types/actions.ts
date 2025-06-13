import type { VIEW_ADMIN } from "types/account";

export type ActionDialogProps = {
  open: boolean;
  onClose: () => void;
  data: Record<VIEW_ADMIN, string>;
};

export type ActionDialogPropsArchive = {
  open: boolean;
  onClose: () => void;
  name: string;
};

export type DialogConsumer = {
  open: boolean;
  onClose: () => void;
  data: Record<string, string>;
};
