import "./modal.css";
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { route } from "../../utils/route";

export default function PatientViewAppointment({
  openModal,
  appointment,
  closeModal,
}) {
  const appURL = import.meta.env.VITE_APP_URL;

  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "success" or "danger"

  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  if (!appointment) {
    return null; // Return null if no appointment details are available
  }

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Appointment Details</h3>
            <p className="mb-0">Verify if the following details are correct.</p>
          </div>

          {alertMessage && (
            <div className={`alert alert-${alertType} mt-3`} role="alert">
              {alertMessage}
            </div>
          )}

          <div className="container text-center">
            <div className="row text-center">
              <label className="fw-bold mt-3 mb-0" htmlFor="appointmentDate">
                Date
              </label>
              <p>
                {appointment.selectedSchedule?.day || "N/A"}{" "}
                {appointment.selectedSchedule?.startTime || "N/A"} -{" "}
                {appointment.selectedSchedule?.endTime || "N/A"}
              </p>
            </div>

            <div className="row text-center">
              <div className="col">
                <label className="fw-bold mb-0" htmlFor="clinician">
                  Clinician
                </label>
                <div>
                  <p className="">
                    {appointment.selectedSchedule?.clinicianName || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="fw-bold mb-0" htmlFor="status">
                    Status
                  </label>
                  <p>{appointment.status || "N/A"}</p>
                </div>
              </div>

              <div className="col">
                <label className="fw-bold mb-0" htmlFor="chiefComplaint">
                  Chief Complaint
                </label>
                <p>{appointment.chiefComplaint || "N/A"}</p>
                <label className="fw-bold mb-0" htmlFor="sourceOfReferral">
                  Source of Referral
                </label>
                <p>{appointment.sourceOfReferral || "N/A"}</p>
              </div>
            </div>

            <div className="col">
              <label className="fw-bold mb-0" htmlFor="referralUpload">
                Referral Upload
              </label>
              {appointment.referralUpload ? (
                <a
                  href={appointment.referralUpload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-link"
                >
                  Open Referral Document
                </a>
              ) : (
                <p>None</p>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button onClick={handleClose} className="button-group bg-white">
              <p className="fw-bold my-0 status">Close</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
