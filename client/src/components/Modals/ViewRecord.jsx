import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

export default function ViewRecord({ header, details, onDelete, onEdit }) {

    // Confirmation Dialog
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const handleConfirmationDialog = () => {
      setIsConfirmationOpen((prevState) => !prevState);
    };

  return (
    <>
      {/* CONFIRMATION DIALOG */}
      {isConfirmationOpen && (
        <ConfirmationDialog
        header={"Delete this SOAP?"}
        body={"Please verify your action."}
          whatAction={"delete"}
          handleModal={handleConfirmationDialog}
          confirm={onDelete}
        />
      )}

      <details className="accordion mb-3 border border rounded-3">
        <summary className="open:bg-danger p-3 rounded-top-3">{header}</summary>

        <p className="px-3 mt-3">{details}</p>

        <div className="d-flex gap-3 m-3 border border-bottom-0 border-start-0 border-end-0">
          <p className="fw-bold mt-3 mb-0 text-button border" onClick={onEdit}>
            Edit
          </p>
          <p
            className="fw-bold mt-3 mb-0 text-button border"
            onClick={handleConfirmationDialog}
          >
            Delete
          </p>
        </div>
      </details>
    </>
  );
}
