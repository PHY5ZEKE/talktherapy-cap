import "./modal.css";
import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

export default function AddSchedule({ closeModal, onScheduleAdded }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  // Callback Function
  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  const appURL = import.meta.env.VITE_APP_URL;

  // Dropdown List
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [selectedWeekday, setSelectedWeekday] = useState(weekdays[0]); // Set initial selected weekday to Monday
  const handleWeekdayChange = (event) => {
    setSelectedWeekday(event.target.value);
  };

  // State for Start and End Time
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get the selected time
  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
  };
  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
  };

  // Helper function to convert 24-hour time to 12-hour time with AM/PM
  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? "PM" : "AM";
    const hour12 = hourInt % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDisabled(true);
    setIsSubmitting(true);

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const schedule = {
      day: selectedWeekday,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };

    try {
      const response = await fetch(`${appURL}/${route.schedule.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(schedule),
      });

      const data = await response.json();
      if (response.ok) {
        onScheduleAdded(data.schedule);
        closeModal();
      } else {
        setErrorMessage(data.message); // Set error message
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.", error); // Set generic error message
    } finally {
      setIsSubmitting(false);
      setIsDisabled(false);
    }
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Add Your Schedule</h3>
            <p className="mb-0">Please fill up the form accordingly.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="container row text-center scrollable-table">
              <div className="col">
                <p className="mb-0">
                  Day <span className="text-required">*</span>
                </p>
                <select
                  className="schedule-options rounded-3 p-3"
                  value={selectedWeekday}
                  onChange={handleWeekdayChange}
                >
                  {weekdays.map((weekday) => (
                    <option key={weekday} value={weekday}>
                      {weekday}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col">
                <p className="mb-0">
                  Start Time<span className="text-required"> *</span>
                </p>
                <input
                  className="schedule-time rounded-3 p-3"
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  required
                />
                <p className="mb-0">
                  End Time<span className="text-required"> *</span>
                </p>
                <input
                  className="schedule-time rounded-3 p-3"
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="alert alert-danger text-center mt-3">
                {errorMessage}
              </div>
            )}

            <div className="d-flex justify-content-center mt-3 gap-3">
              <button
                type="submit"
                className="text-button border"
                disabled={isDisabled || isSubmitting}
              >
                <p className="fw-bold my-0 status">
                  {isSubmitting ? `Submitting` : `Submit`}
                </p>
              </button>
              <button onClick={handleClose} className="text-button-red border">
                <p className="fw-bold my-0 status">Cancel</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
