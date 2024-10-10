import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";

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
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />
        {/* Add Schedule Modal */}
        {isOpen && (
          <AddSchedule
            closeModal={handleAdd}
            onScheduleAdded={handleScheduleAdded}
          />
        )}
        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-stretch"
        >
          {/* TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">
                {clinicianData?.firstName || "Clinician"}
              </p>
            </div>
          </Row>

          {/* TOAL ADMINS */}
          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-flex justify-content-center align-items-center">
                  <h5 className="m-0 fw-bold">Manage Your Schedule</h5>
                </div>
              </div>
            </div>
          </Row>

          <Row lg md>
            {/* CALENDAR */}
            <Col lg className="height-responsive">
              {/* CONTENT LIST */}
              <div className="card-container d-flex flex-wrap justify-content-center align-items-center flex-row gap-3 scrollable-div-5 notif-home">
                <div className="w-100 d-flex justify-content-center">
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    inline
                    dayClassName={getDayClassName}
                  />
                </div>

                <button className="action-btn" onClick={handleAdd}>
                  Add Schedule
                </button>
              </div>
            </Col>

            {/* PREVIEW SCHEDULE LIST */}
            <Col lg>
              <div className="card-container d-flex flex-wrap align-items-center flex-row scrollable-div-5 notif-home">
                <div className="p-3 w-100">
                  <h4 className="fw-bold mb-0">
                    {clinicianData?.firstName || "Clinician"}'s Schedule
                  </h4>
                  <p className="mb-0">
                    {selectedDate
                      ? selectedDate.toDateString()
                      : "Select a date"}
                  </p>
                </div>

                {getSchedulesForSelectedDay.map((schedule, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-start align-items-center w-100 p-2 border-top border-bottom"
                  >
                    <div className="w-50">
                      <h5 className="fw-bold mb-0">
                        {schedule.startTime} - {schedule.endTime}
                      </h5>
                      <p className="mb-0">{schedule.day}</p>
                      <p className="mb-0">Status: {schedule.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            <Col lg></Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
