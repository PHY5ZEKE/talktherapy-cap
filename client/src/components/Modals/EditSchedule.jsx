import "./modal.css";
import { useState, useEffect } from "react";
import { route } from "../../utils/route";

export default function EditSchedule({
  closeModal,
  onScheduleUpdated,
  scheduleId,
}) {
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

  // Fetch existing schedule details
  useEffect(() => {
    const fetchSchedule = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored

      try {
        const response = await fetch(
          `${appURL}/${route.schedule.getScheduleById}/${scheduleId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setSelectedWeekday(data.schedule.day);
          setStartTime(data.schedule.startTime);
          setEndTime(data.schedule.endTime);
        } else {
          setErrorMessage(data.message); // Set error message
        }
      } catch (error) {
        setErrorMessage("An error occurred. Please try again."); // Set generic error message
      }
    };

    fetchSchedule();
  }, [appURL, scheduleId]);

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

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);
    const schedule = {
      day: selectedWeekday,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    };

    try {
      const response = await fetch(
        `${appURL}/${route.schedule.edit}/${scheduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(schedule),
        }
      );

      const data = await response.json();
      if (response.ok) {
        onScheduleUpdated(data.schedule);
        closeModal();
      } else {
        setErrorMessage(data.message); // Set error message
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again."); // Set generic error message
    }
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Edit Your Schedule</h3>
            <p className="mb-0">Please fill up the form accordingly.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="container row text-center scrollable-table">
              <div className="col">
                <p className="mb-0">Day</p>
                <select value={selectedWeekday} onChange={handleWeekdayChange}>
                  {weekdays.map((weekday) => (
                    <option key={weekday} value={weekday}>
                      {weekday}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col">
                <p className="mb-0">Start Time</p>
                <input
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  required
                />
                <p className="mb-0">End Time</p>
                <input
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
              <button type="submit" className="text-button border">
                <p className="fw-bold my-0 status">SUBMIT</p>
              </button>
              <button onClick={handleClose} className="text-button border">
                <p className="fw-bold my-0 status">CANCEL</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
