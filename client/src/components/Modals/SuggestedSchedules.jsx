import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

import { emailCreateAppointment } from "../../utils/emailCreateAppointment";
export default function SuggestedSchedules({
  closeModal,
  medicalDiagnosis,
  onScheduleSelect,
  onWebSocket,
  patientName,
  currentScheduleId, // Add currentScheduleId to props
  appointmentId,
  appointment,
  patientId,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedSchedule) {
      setError("No schedule selected");
      return;
    }

    try {
      console.log("Submitting schedule change request...");
      console.log("Selected Schedule:", selectedSchedule);

      const response = await fetch(
        `${appURL}/${route.appointment.updateAppointment}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            appointmentId: appointmentId,
            selectedScheduleId: selectedSchedule._id,
            selectedClinicianId: selectedSchedule.clinicianId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        throw new Error("Failed to update appointment");
      }

      const data = await response.json();
      onScheduleSelect(data.appointment);

      // Send Email
      const { clinicianName, day, startTime, endTime } =
        appointment.selectedSchedule;
      let appointmentData = { clinicianName, day, startTime, endTime };
      emailCreateAppointment(
        appointment.selectedClinician._id,
        appointment.patientId._id,
        "Pending",
        appointmentData
      );

      setSuccessMessage("Appointment updated successfully");

      const userUpdate = {
        notif: "appointmentChange",
        body: `${patientName} has updated their appointment to ${selectedSchedule.day} ${selectedSchedule.startTime} ${selectedSchedule.endTime}.`,
        show_to: ["admin"],
      };

      onWebSocket(userUpdate);

      closeModal();
    } catch (error) {
      console.error("Error during schedule change request:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`${appURL}/${route.schedule.clinician}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        const filteredSchedules = data.filter(
          (schedule) =>
            schedule.specialization === medicalDiagnosis &&
            schedule._id !== currentScheduleId // Filter out the current schedule
        );
        setSchedules(filteredSchedules);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSchedules();
  }, [medicalDiagnosis, currentScheduleId]);

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Suggested Schedules</h3>
            <p className="mb-0">
              Your appointment request has been denied. Try to select another
              schedule. The following are suggested schedules.
            </p>
            <p>
              This will notify the admin and your request will be tagged as
              pending.
            </p>
          </div>

          <div className="container text-center scrollable-table">
            <div className="row text-center">
              <table className="table ">
                <thead>
                  <tr>
                    <th scope="col">Clinician</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(
                    (schedule, index) =>
                      schedule.status === "Available" && (
                        <tr
                          key={index}
                          className={
                            selectedSchedule &&
                            selectedSchedule._id === schedule._id
                              ? "table-active"
                              : ""
                          }
                        >
                          <td>{`${schedule.clinicianId.firstName} ${schedule.clinicianId.lastName}`}</td>
                          <th scope="row">{schedule.day}</th>
                          <td>
                            {schedule.startTime} - {schedule.endTime}
                          </td>
                          <td>
                            <button
                              className="text-button-table border"
                              onClick={() => setSelectedSchedule(schedule)}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button
              onClick={handleSubmit}
              className="text-button border"
              disabled={!selectedSchedule}
            >
              Submit
            </button>
            <button onClick={handleClose} className="text-button-red border">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
