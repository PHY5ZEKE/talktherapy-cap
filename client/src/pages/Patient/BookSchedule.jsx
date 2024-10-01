import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import Dropdown from "react-bootstrap/Dropdown";
import JoinAppointment from "../../components/Modals/JoinAppointment";

// DatePicker
import { useState, useEffect, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookSchedule() {
  // DatePicker Instance
  const [startDate, setStartDate] = useState(new Date());

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [allSched, setAllSchedule] = useState([]);

  // Modal Handle
  const [isOpen, setIsOpen] = useState(false);

  const handleModal = () => {
    setIsOpen(!isOpen);
  };

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

    const fetchPatientData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/patient-SLP/get-patient",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const data = await response.json();
        setPatientData(data.patient);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchAll = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/schedule/patient-schedules",
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
        console.log("All Schedules fetched:", data);
        setAllSchedule(data);
      } catch (error) {
        console.error("Error fetching schedules:", error.message);
        setError(error.message);
      }
    };

    fetchPatientData();
    fetchAll();
  }, []);

  const getAllSchedulesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const filteredSchedules = allSched.filter(
      (schedule) => schedule.day === dayOfWeek
    );
    console.log(`Schedules for ${dayOfWeek}:`, filteredSchedules);
    return filteredSchedules;
  }, [selectedDate, allSched]);

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
    <Container>
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* Join Appointment Modal */}
        {isOpen && <JoinAppointment openModal={handleModal} />}

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
              <p className="m-0 fw-bold">{patientData?.firstName || "Admin"}</p>
            </div>
          </Row>

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
                <div className="w-100 d-grid row justify-content-center">
                  <div className="mx-auto row justify-content-center">
                    <div className="col">
                      <select
                        className="form-select form-select-lg mb-3"
                        aria-label=".form-select-lg example"
                      >
                        <option selected>Specialization</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                      </select>
                    </div>
                  </div>

                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    inline
                    dayClassName={getDayClassName}
                  />
                </div>
              </div>
            </Col>

            {/* PREVIEW SCHEDULE LIST */}
            <Col lg>
              <div className="card-container d-flex flex-wrap align-items-center flex-row scrollable-div-5 notif-home">
                <div className="p-3 w-100">
                  <h4 className="fw-bold mb-0">Available Schedule</h4>
                  <p className="mb-0">
                    {selectedDate
                      ? selectedDate.toDateString()
                      : "Select a date"}
                  </p>
                </div>

                {/* DATE COMPONENT */}
                {getAllSchedulesForSelectedDay.map((schedule, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-start align-items-center w-100 p-2 border-top border-bottom"
                  >
                    <div className="w-100">
                      <h5 className="fw-bold mb-0">
                        {schedule.startTime} - {schedule.endTime}
                      </h5>
                      <p className="mb-0">{schedule.day}</p>
                    </div>
                    <button
                      className="button-group bg-white"
                      onClick={handleModal}
                    >
                      <p className="fw-bold my-0 status">JOIN</p>
                    </button>
                  </div>
                ))}
              </div>
            </Col>

            <Col lg>
              <div className="card-container d-flex flex-wrap p-4 justify-content-center align-items-center flex-row gap-3 scrollable-div-5 notif-home">
                <h4 className="text-left fw-bold">Your Appointments</h4>
                <div className="d-flex justify-content-start align-items-center w-100 p-2 border-top border-bottom">
                  <div className="w-100">
                    <h5 className="fw-bold mb-0">TIME</h5>
                    <p className="mb-0">DAY</p>
                  </div>

                  {/* IF PENDING */}
                  <button className="button-group bg-white">
                    <p className="fw-bold my-0 status">PENDING</p>
                  </button>

                  {/* IF ACCEPTED */}
                  <button className="button-group bg-white">
                    <p className="fw-bold my-0 status">JOIN</p>
                  </button>

                  <button className="button-group bg-white">
                    <p className="fw-bold my-0 status">CANCEL</p>
                  </button>


                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
