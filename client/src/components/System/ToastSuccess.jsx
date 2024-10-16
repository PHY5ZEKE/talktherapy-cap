import { useEffect } from "react";

export default function ToastSuccess({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const toastElement = document.getElementById("toast");
      const toast = new window.bootstrap.Toast(toastElement);
      toast.show();
    }
  });
  return (
    <div
      className="toast-container position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 11 }}
    >
      <div
        id="toast"
        className="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header">
          <strong className="me-auto">Notification</strong>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="toast"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
}
