import "./modal.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { route } from "../../utils/route";

export default function AppointmentDetails({ openModal, appointment }) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "success" or "danger"
  const appURL = import.meta.env.VITE_APP_URL;

  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${appURL}/${route.appointment.updateStatus}/${appointment._id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setAlertMessage("Appointment status updated successfully.");
      setAlertType("success");
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Reload after 2 seconds
    } catch (error) {
      setAlertMessage("Error updating appointment status.");
      setAlertType("danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Appointment details in modal:", appointment); // Debugging statement
  }, [appointment]);

  if (!appointment) {
    return null; // Return null if no appointment details are available
  }

  const renderStatusButton = () => {
    switch (appointment.status) {
      case "Pending":
        return (
          <>
            <button
              onClick={() => updateStatus("Accepted")}
              className="button-group bg-white"
              disabled={loading}
            >
              <p className="fw-bold my-0 status">Accept</p>
            </button>
            <button
              onClick={() => updateStatus("Rejected")}
              className="button-group bg-white"
              disabled={loading}
            >
              <p className="fw-bold my-0 status">Reject</p>
            </button>
          </>
        );
      case "Completed":
        return <p className="fw-bold my-0 status">Appointment Completed</p>;
      case "Rejected":
        return <p className="fw-bold my-0 status">Appointment Rejected</p>;
      default:
        return null;
    }
  };

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
              <p className="fw-bold mt-3 mb-0">Patient Name</p>
              <p>
                {appointment.patientId.firstName}{" "}
                {appointment.patientId.middleName}{" "}
                {appointment.patientId.lastName}
              </p>
            </div>

            <div className="row text-center">
              <p className="fw-bold mt-3 mb-0">Date</p>
              <p>
                {appointment.selectedSchedule?.day || "N/A"}{" "}
                {appointment.selectedSchedule?.startTime || "N/A"} -{" "}
                {appointment.selectedSchedule?.endTime || "N/A"}
              </p>
            </div>

            <div className="row text-center">
              <div className="col">
                <p className="fw-bold mb-0">Clinician</p>
                <div>
                  <p className="">
                    {appointment.selectedSchedule?.clinicianName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="fw-bold mb-0">Status</p>
                  <p>{appointment.status || "N/A"}</p>
                </div>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Chief Complaint</p>
                <p>{appointment.chiefComplaint || "N/A"}</p>
                <p className="fw-bold mb-0">Source of Referral</p>
                <p>{appointment.sourceOfReferral || "N/A"}</p>
              </div>
            </div>

            <div className="col">
              <p className="fw-bold mb-0">Referral Upload</p>
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
            {renderStatusButton()}
            <button onClick={handleClose} className="button-group bg-white">
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
