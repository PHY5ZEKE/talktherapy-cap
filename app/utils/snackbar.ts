import { useState, useCallback } from "react";

export const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "warning" | "info") => {
      setMessage(message);
      setSeverity(severity);
      setOpen(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, message, severity, showSnackbar, handleClose };
};
