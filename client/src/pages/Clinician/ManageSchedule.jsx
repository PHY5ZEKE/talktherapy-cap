import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";

// DatePicker
import { useState, useEffect, useCallback, useMemom, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import AddSchedule from "../../components/Modals/AddSchedule";
import EditSchedule from "../../components/Modals/EditSchedule"; // Import the EditSchedule component

export default function ManageSchedule() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  // DatePicker Instance
  const [startDate, setStartDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
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

  // Handle Add Schedule Modal Open
  const [isAddOpen, setIsAddOpen] = useState(false);
  const handleAdd = useCallback(() => {
    setIsAddOpen((prevIsOpen) => !prevIsOpen);
  }, []);

  const handleScheduleAdded = useCallback((newSchedule) => {
    notify(toastMessage.success.addSchedule);
    setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
  }, []);

  const handleDateChange = useCallback((date) => {
    setStartDate(date);
    setSelectedDate(date);
  }, []);

  // Handle Edit Schedule Modal Open
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const handleEdit = useCallback((scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setIsEditOpen(true);
  }, []);

  const handleScheduleUpdated = useCallback((updatedSchedule) => {
    notify(toastMessage.success.editSchedule);
    setSchedules((prevSchedules) =>
      prevSchedules.map((schedule) =>
        schedule._id === updatedSchedule._id ? updatedSchedule : schedule
      )
    );
    setIsEditOpen(false);
  }, []);

  const handleDelete = useCallback(async (scheduleId) => {
    try {
      const response = await fetch(
        `${appURL}/${route.schedule.delete}/${scheduleId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      notify(toastMessage.success.deleteSchedule);
      setSchedules((prevSchedules) =>
        prevSchedules.filter((schedule) => schedule._id !== scheduleId)
      );
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    const fetchClinicianData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch clinician data");
        }

        const data = await response.json();
        setClinicianData(data.clinician);
        setLoading(false);
      } catch (error) {
        failNotify(toastMessage.fail.error);
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
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }

        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        failNotify(toastMessage.fail.error);
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
    return filteredSchedules;
  }, [selectedDate, schedules]);

  const getDayClassName = useCallback(
    (date) => {
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
      const hasSchedule = schedules.some(
        (schedule) => schedule.day === dayOfWeek
      );
      return hasSchedule ? { backgroundColor: "green", color: "white" } : {};
    },
    [schedules]
  );

  return (
    <>
      {/* Add Schedule Modal */}
      {isAddOpen && (
        <AddSchedule
          closeModal={handleAdd}
          onScheduleAdded={handleScheduleAdded}
        />
      )}

      {/* Edit Schedule Modal */}
      {isEditOpen && (
        <EditSchedule
          closeModal={() => setIsEditOpen(false)}
          onScheduleUpdated={handleScheduleUpdated}
          scheduleId={selectedScheduleId}
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
                    <div className="mb-3 d-flex flex-column justify-content-center gap-3 flex-nowrap">
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

                          {schedule.status !== "Booked" && (
                            <>
                              <div
                                className="mb-3 fw-bold text-button border"
                                onClick={() => handleEdit(schedule._id)}
                              >
                                Edit
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                onClick={() => handleDelete(schedule._id)}
                              >
                                Delete
                              </div>
                            </>
                          )}
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
