import { useEffect, useState } from "react";
import "./modal.css";
export default function ChooseSchedule({ closeModal }) {
  const [schedules, setSchedules] = useState([]);

  const [error, setError] = useState(null);

  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)
    const fetchSchedules = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/schedule/get-schedules",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }

        const data = await response.json();
        console.log("Schedules fetched:", data);
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching schedules:", error.message);
        setError(error.message);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Choose a schedule</h3>
            <p className="mb-0">The following are available schedules.</p>
            <p>
              This will notify the corresponding user and will be tagged as
              pending.
            </p>
          </div>

          <div className="container text-center scrollable-table">
            {/* SCHEDULE LIST RENDER */}
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
                        <tr key={index}>
                          <th scope="row">{schedule.day}</th>
                          <td>
                            {schedule.startTime} - {schedule.endTime}
                          </td>
                          <td>
                            <button className="button-group bg-white">
                              <p className="fw-bold my-0 status">ACCEPT</p>
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
            <button onClick={handleClose} className="button-group bg-white">
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
