import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";

// DatePicker
import { useState, useEffect, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import AddSchedule from "../../components/Modals/AddSchedule";

export default function ManageSchedule() {
  // DatePicker Instance
  const [startDate, setStartDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  // Handle Add Schedule Modal Open
  const [isOpen, setIsOpen] = useState(false);
  const handleAdd = useCallback(() => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  }, []);

  const handleScheduleAdded = useCallback((newSchedule) => {
    console.log("New schedule added:", newSchedule);
    setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
  }, []);

  const handleDateChange = useCallback((date) => {
    console.log("Date selected:", date);
    setStartDate(date);
    setSelectedDate(date);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

    const fetchClinicianData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clinician data");
        }

        const data = await response.json();
        console.log("Clinician data fetched:", data);
        setClinicianData(data.clinician);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clinician data:", error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchSchedules = async () => {
      try {
        const response = await fetch(`${appURL}/${route.schedule.get}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

    fetchClinicianData();
    fetchSchedules();
  }, []);

  const getSchedulesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const filteredSchedules = schedules.filter(
      (schedule) => schedule.day === dayOfWeek
    );
    console.log(`Schedules for ${dayOfWeek}:`, filteredSchedules);
    return filteredSchedules;
  }, [selectedDate, schedules]);

  const getDayClassName = useCallback(
    (date) => {
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
      const hasSchedule = schedules.some(
        (schedule) => schedule.day === dayOfWeek
      );
      console.log(`Checking day: ${dayOfWeek}, hasSchedule: ${hasSchedule}`);
      return hasSchedule ? { backgroundColor: "green", color: "white" } : {};
    },
    [schedules]
  );

  return (
    <>
      {/* Add Schedule Modal */}
      {isOpen && (
        <AddSchedule
          closeModal={handleAdd}
          onScheduleAdded={handleScheduleAdded}
        />
      )}

      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : clinicianData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {clinicianData?.firstName} {clinicianData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Your Schedule</p>
                    <p className="mb-0">
                      Select a date to view available clinician schedules.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <div className="mb-3 d-flex flex-column gap-3 flex-nowrap">
                      <button
                        className="text-button border w-100"
                        onClick={handleAdd}
                      >
                        Add Schedule
                      </button>
                      <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        inline
                        dayClassName={getDayClassName}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">
                      {clinicianData?.firstName}'s Schedule
                    </p>
                    <p className="mb-0">
                      {selectedDate
                        ? selectedDate.toDateString()
                        : "Select a date"}
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {getSchedulesForSelectedDay.length === 0 ? (
                      <h5 className="mb-0 fw-bold text-center">
                        No schedule available for the selected date.
                      </h5>
                    ) : (
                      getSchedulesForSelectedDay.map((schedule, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-start align-items-center w-100 p-2 border-top-0 border-bottom"
                        >
                          <div className="w-100">
                            <h5 className="fw-bold mb-0">
                              {schedule.startTime} - {schedule.endTime}
                            </h5>

                            <p className="mb-0">{schedule.day}</p>
                            <p className="mb-0 my-2">
                              Status:{" "}
                              <span className="fw-bold">{schedule.status}</span>
                            </p>
                          </div>

                          <div className="mb-3 fw-bold text-button border">
                            Edit
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
