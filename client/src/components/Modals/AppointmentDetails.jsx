import "./modal.css";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { route } from "../../utils/route";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

import { emailRequestStatus } from "../../utils/emailRequestStatus";

export default function AppointmentDetails({
  openModal,
  appointment,
  onWebSocket,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [loading, setLoading] = useState(false);
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

  const clinicianName = `${appointment.selectedClinician?.firstName} ${appointment.selectedClinician?.middleName} ${appointment.selectedClinician?.lastName}`;

  const updateStatus = async (newStatus, oldStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${appURL}/${route.appointment.updateStatus}/${appointment._id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let userUpdate = {};
      switch (oldStatus) {
        case "Pending":
          userUpdate = {
            notif: "appointmentRequestStatus",
            body: `${appointment.patientId?.firstName} ${
              appointment.patientId?.lastName
            }'s pending appointment with Clinician ${clinicianName} has been ${newStatus.toLowerCase()}`,
            show_to: [
              appointment.patientId?._id,
              appointment.selectedClinician._id,
            ],
          };
          break;
        case "Schedule Change Request":
          userUpdate = {
            notif: "appointmentRequestStatus",
            body: `${appointment.patientId?.firstName} ${
              appointment.patientId?.lastName
            }'s request for permanent schedule change with Clinician ${clinicianName} has been ${newStatus.toLowerCase()}`,
            show_to: [
              appointment.patientId?._id,
              appointment.selectedClinician?._id,
            ],
          };
          break;
        case "Temporary Reschedule Request":
          userUpdate = {
            notif: "appointmentRequestStatus",
            body: `${appointment.patientId?.firstName} ${
              appointment.patientId?.lastName
            }'s request for temporary schedule change with Clinician ${clinicianName} has been ${newStatus.toLowerCase()}`,
            show_to: [
              appointment.patientId?._id,
              appointment.selectedClinician?._id,
            ],
          };
          break;
        case "Temporarily Rescheduled":
          userUpdate = {
            notif: "appointmentRequestStatus",
            body: `${appointment.patientId?.firstName} ${
              appointment.patientId?.lastName
            }'s temporary schedule with Clinician ${clinicianName} has been ${newStatus.toLowerCase()}`,
            show_to: [
              appointment.patientId?._id,
              appointment.selectedClinician?._id,
            ],
          };
          break;
        case "Accepted":
          userUpdate = {
            notif: "appointmentRequestStatus",
            body: `${appointment.patientId?.firstName} ${
              appointment.patientId?.lastName
            }'s appointment schedule with Clinician ${clinicianName} has been ${newStatus.toLowerCase()}`,
            show_to: [
              appointment.patientId?._id,
              appointment.selectedClinician?._id,
            ],
          };
          break;
        default:
          break;
      }

      emailRequestStatus(
        appointment.selectedClinician._id,
        appointment.patientId._id,
        newStatus,
        appointment
      );
      onWebSocket(userUpdate);
      notify(toastMessage.success.statusBook);
      openModal();
    } catch (error) {
      failNotify(toastMessage.fail.status);
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return null; // Return null if no appointment details are available
  }

  const renderStatusButton = () => {
    switch (appointment.status) {
      case "Pending":
      case "Schedule Change Request":
      case "Temporary Reschedule Request":
        return (
          <>
            <button
              onClick={() => updateStatus("Accepted", appointment.status)}
              className="text-button border"
              disabled={loading}
            >
              <p className="fw-bold my-0 status">Accept</p>
            </button>
            <button
              onClick={() => updateStatus("Rejected", appointment.status)}
              className="text-button border"
              disabled={loading}
            >
              <p className="fw-bold my-0 status">Reject</p>
            </button>
          </>
        );
      case "Temporarily Rescheduled":
        return (
          <>
            <button
              onClick={() => updateStatus("Reverted", appointment.status)}
              className="text-button border"
              disabled={loading}
            >
              <p className="fw-bold my-0 status">Revert</p>
            </button>
          </>
        );
      case "Accepted":
        return (
          <>
            <button
              onClick={() => updateStatus("Completed", appointment.status)}
              className="text-button border"
              disabled={loading}
            >
              <p className="fw-bold my-0 status">Complete</p>
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
                  <p className="">{`${clinicianName}` || "N/A"}</p>
                </div>

                <div>
                  <p className="fw-bold mb-0">Status</p>
                  <p>{appointment.status || "N/A"}</p>
                </div>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Medical Diagnosis</p>
                <p>{appointment.medicalDiagnosis || "N/A"}</p>
                <p className="fw-bold mb-0">Chief Complaint</p>
                <p>{appointment.chiefComplaint || "N/A"}</p>
                <p className="fw-bold mb-0">Source of Referral</p>
                <p>{appointment.sourceOfReferral || "N/A"}</p>
              </div>
            </div>

            {appointment.status === "Schedule Change Request" && (
              <div className="row text-center">
                <div className="col">
                  <p className="fw-bold mb-0">New Schedule</p>
                  <p>
                    {appointment.newSchedule?.day || "N/A"}{" "}
                    {appointment.newSchedule?.startTime || "N/A"} -{" "}
                    {appointment.newSchedule?.endTime || "N/A"}
                  </p>

                  <p className="fw-bold mb-0">Reason for Reschedule</p>
                  <p>{appointment.changeReason || "N/A"}</p>
                </div>
              </div>
            )}

            {appointment.status === "Temporary Reschedule Request" && (
              <div className="row text-center">
                <div className="col">
                  <p className="fw-bold mb-0">Temporary Schedule</p>
                  <p>
                    {appointment.temporaryReschedule?.day || "N/A"}{" "}
                    {appointment.temporaryReschedule?.startTime || "N/A"} -{" "}
                    {appointment.temporaryReschedule?.endTime || "N/A"}
                  </p>

                  <p className="fw-bold mb-0">Reason for Reschedule</p>
                  <p>{appointment.changeReason || "N/A"}</p>
                </div>
              </div>
            )}

            {appointment.status === "Temporarily Rescheduled" && (
              <div className="row text-center">
                <div className="col">
                  <p className="fw-bold mb-0">Temporary Schedule</p>
                  <p>
                    {appointment.temporaryReschedule?.day || "N/A"}{" "}
                    {appointment.temporaryReschedule?.startTime || "N/A"} -{" "}
                    {appointment.temporaryReschedule?.endTime || "N/A"}
                  </p>

                  <p className="fw-bold mb-0">Reason for Reschedule</p>
                  <p>{appointment.changeReason || "N/A"}</p>
                </div>
              </div>
            )}

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
            <button onClick={handleClose} className="text-button-red border">
              <p className="fw-bold my-0 status">Close</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
