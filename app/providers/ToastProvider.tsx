import { Alert, Snackbar } from "@mui/material";
import { createContext, useState, useCallback, useContext } from "react";
import type { PropsWithChildren } from "react";

type ToastContextType = {
  showSnackbar: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default function ToastProvider({ children }: PropsWithChildren) {
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

  return (
    <ToastContext.Provider value={{ showSnackbar }}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={severity}>{message}</Alert>
      </Snackbar>
      {children}
    </ToastContext.Provider>
  );
}
