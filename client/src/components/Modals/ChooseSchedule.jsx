import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";

export default function ChooseSchedule({
  closeModal,
  clinicianId,
  onScheduleSelect,
  appointment, // Add appointment to props
  onWebSocket,
  patientName,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [schedules, setSchedules] = useState([]);
  const [reason, setReason] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null); // Add state for selected schedule
  const appURL = import.meta.env.VITE_APP_URL;
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Add state for success message

  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!appointment) {
      setError("No appointment selected");
      return;
    }
    if (!selectedSchedule) {
      setError("No schedule selected");
      return;
    }
    if (!reason.trim()) {
      setError("Reason for rescheduling is required");
      return;
    }

    try {
      const response = await fetch(
        `${appURL}/${route.appointment.requestScheduleChange}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            appointmentId: appointment._id,
            newScheduleId: selectedSchedule._id,
            reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to request schedule change");
      }

      const data = await response.json();
      onScheduleSelect(data.appointment);
      setSuccessMessage("Schedule change request submitted successfully");

      const userUpdate = {
        notif: "appointmentChange",
        body: `${patientName} is request a permanent change in schedule with Dr. ${appointment?.selectedSchedule?.clinicianName} to be set at ${selectedSchedule.day} ${selectedSchedule.startTime} ${selectedSchedule.endTime}.`,
        show_to: ["admin"],
        reason: `${reason}`,
      };
      
      onWebSocket(userUpdate);

      closeModal();
    } catch (error) {
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
        setSchedules(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSchedules();
  }, [clinicianId]);

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Choose a schedule</h3>
            <p className="mb-0">The following are available schedules.</p>
            <p>This will notify the admin</p>
          </div>

          <div className="container text-center scrollable-table">
            <div className="row text-center">
              <table className="table ">
                <thead>
                  <tr>
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
                              ? "table-active" // Add a class to highlight the selected schedule
                              : ""
                          }
                        >
                          <th scope="row">{schedule.day}</th>
                          <td>
                            {schedule.startTime} - {schedule.endTime}
                          </td>
                          <td>
                            <button
                              className="text-button-table border"
                              onClick={() => {
                                setSelectedSchedule(schedule);
                              }} // Set selected schedule
                            >
                              <p className="fw-bold my-0 status">Select</p>
                            </button>
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <form className="container" onSubmit={handleSubmit}>
              <p className="text-center">
                What is your reason for rescheduling the current session?
              </p>
              <textarea
                className="form-control"
                aria-label="With textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
              {error && <p className="text-danger">{error}</p>}
              {successMessage && (
                <p className="text-success">{successMessage}</p>
              )}
              <div className="d-flex justify-content-center mt-3 gap-3">
                <button type="submit" className="text-button border">
                  <p className="fw-bold my-0 status">Submit</p>
                </button>
                <button onClick={handleClose} className="text-button border">
                  <p className="fw-bold my-0 status">Cancel</p>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
