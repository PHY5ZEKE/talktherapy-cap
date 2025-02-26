import { useState } from "react";
import "./modal.css";

import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";

export default function RequestAccess({
  openModal,
  clinicianId,
  patientId,
  accessToken,
  clinicianName,
  patientName,
  onWebSocket,
}) {
  const [reason, setReason] = useState("");
  const appURL = import.meta.env.VITE_APP_URL;

  const notify = (message) =>
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      failNotify("Reason is required");
      return;
    }

    try {
      const response = await fetch(
        `${appURL}/${route.clinician.requestAccess}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            clinicianId,
            patientId,
            reason,
            status: "Pending",
          }),
        }
      );

      const data = await response.json();

      const userUpdate = {
        notif: "appointmentRequestAccess",
        body: `${clinicianName} is requesting record access for ${patientName}`,
        reason: reason,
        show_to: ["admin"],
      };

      if (!response.ok) {
        console.error(data.message || "Failed to request access");
        throw new Error(data.message || "Failed to request access");
      }
      notify("Access requested successfully");
      onWebSocket(userUpdate);
      openModal();
    } catch (error) {
      failNotify(error.message);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-content-center">
        <div className="d-flex flex-column text-center">
          <h3 className="fw-bold">Request Access</h3>
          <p className="">
            You are requesting for access to this patient's records.
          </p>
        </div>

        <div className="d-flex justify-content-center">
          <form className="container w-100" onSubmit={handleSubmit}>
            <p className="fw-bold text-center mb-1">
              State Reason <span className="text-required">*</span>
            </p>
            <textarea
              className="form-control"
              aria-label="With textarea"
              placeholder="Enter your reason for requesting access to this patient's records"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            ></textarea>
            <div className="d-flex justify-content-center mt-3 gap-3">
              <button type="submit" className="text-button border">
                <p className="fw-bold my-0 status">Submit</p>
              </button>
              <button className="text-button-red border" onClick={handleClose}>
                <p className="fw-bold my-0 status">Cancel</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
