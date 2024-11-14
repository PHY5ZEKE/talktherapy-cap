import { useNavigate } from "react-router-dom";
import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import JoinAppointment from "../../components/Modals/JoinAppointment";
import MenuDropdown from "../../components/Layout/PatientMenu";
import PatientViewAppointment from "../../components/Modals/PatientViewAppointment";
import ConfirmReschedule from "../../components/Modals/ConfirmReschedule";
import ChooseSchedule from "../../components/Modals/ChooseSchedule";
import TemporaryRescheduleConfirmation from "../../components/Modals/TemporaryRescheduleConfirmation";
import TemporarySchedule from "../../components/Modals/TemporaryReshedule";

// DatePicker
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useRef,
} from "react";
import { AuthContext } from "../../utils/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faStethoscope,
  faUserDoctor,
  faLocationDot,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookSchedule() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  // DatePicker Instance
  const [startDate, setStartDate] = useState(new Date());

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [allSched, setAllSchedule] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const [hasBooked, setHasBooked] = useState(false);

  const navigate = useNavigate();

  // Modal Handle
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  // State for storing appointments
  const [appointments, setAppointments] = useState([]);

  // Handle Confirm Reschedule Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const [isTemporarySchedule, setIsTemporarySchedule] = useState(false);
  const [isChoose, setIsChoose] = useState(false);
  const [isViewAppointment, setIsViewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [isTemporaryReschedule, setIsTemporaryReschedule] = useState(false);
  const [clinicianIdForReschedule, setClinicianIdForReschedule] =
    useState(null); // New state

  const handleModal = (clinician, schedule) => {
    setSelectedClinician(clinician);
    setSelectedSchedule(schedule);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const notify = (message) => {
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });
  };

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const handleDateChange = useCallback((date) => {
    setStartDate(date);
    setSelectedDate(date);
  }, []);

  const handleSpecializationChange = (event) => {
    setSelectedSpecialization(event.target.value);
  };

  const joinMeeting = (id, details) => {
    navigate(`/room/${id}`, {
      state: {
        appointmentDetails: details,
      },
    });
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewAppointment(true);
  };

  const closeViewAppointmentModal = () => {
    setIsViewAppointment(false);
    setSelectedAppointment(null);
  };

  const closeConfirmModal = () => {
    setIsConfirm(false);
  };

  const closeChooseScheduleModal = () => {
    setIsChoose(false);
  };

  const openTemporaryScheduleModal = () => {
    setIsTemporarySchedule(true);
  };

  const closeTemporaryScheduleModal = () => {
    setIsTemporarySchedule(false);
  };

  const openConfirmRescheduleModal = (appointment) => {
    setAppointmentToReschedule(appointment);
    setClinicianIdForReschedule(appointment.selectedClinician);
    setIsConfirm(true);
  };

  const openTemporaryRescheduleModal = (appointment) => {
    setAppointmentToReschedule(appointment);
    setClinicianIdForReschedule(appointment.selectedClinician);
    setIsTemporaryReschedule(true);
  };

  const socket = useRef(null);
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.patient.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
        });

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
        const response = await fetch(`${appURL}/${route.schedule.clinician}`, {
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
        setAllSchedule(data);
      } catch (error) {
        failNotify(toastMessage.fail.error);
        setError(error.message);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${appURL}/${route.appointment.get}`, {
          method: "GET",
          headers: {
            "Content-Type": "application",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setHasBooked(isBooked(data));
        setAppointments(data);
      } catch (error) {
        failNotify(toastMessage.fail.error);
        setError(error.message);
      }
    };

    fetchPatientData();
    fetchAll();
    fetchAppointments();

    // WebSocket
    socket.current = new WebSocket(`${import.meta.env.VITE_LOCALWS}`);

    socket.current.onopen = () => {
      console.log("Connected to the server");
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        fetchAll();
        fetchAppointments();
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected from the server");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  console.log(allSched)
  const webSocketNotification = async (message) => {
    const response = JSON.stringify(message);
    const parsed = JSON.parse(response);

    let notification = {};

    if (parsed.notif === "appointmentJoin") {
      notification = {
        type: "notification",
      };
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(notification));
      }
    }

    if (parsed.notif === "appointmentResched") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
        reason: parsed.reason,
      };
    }

    if (parsed.notif === "appointmentChange") {
      notification = {
        body: `${parsed.body}`,
        date: new Date(),
        show_to: parsed.show_to,
        reason: parsed.reason,
      };
    }

    try {
      const response = await fetch(`${appURL}/${route.notification.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
      const result = await response.json();

      // Notify WebSocket server
      const resultWithNotif = { ...result, type: "notification" };

      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify(resultWithNotif));
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  function isBooked(appointments) {
    // Check if the patient has any appointments that are Accepted if so, return true
    return appointments.some(
      (appointment) =>
        appointment.status === "Pending" ||
        appointment.status === "Schedule Change Request" ||
        appointment.status === "Temporary Schedule Request" ||
        appointment.status === "Temporarily Scheduled" ||
        appointment.status === "Accepted"
    );
  }

  const getAllSchedulesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const filteredSchedules = allSched.filter(
      (schedule) =>
        schedule.day === dayOfWeek &&
        (!selectedSpecialization ||
          schedule.specialization === selectedSpecialization)
    );
    return filteredSchedules;
  }, [selectedDate, allSched, selectedSpecialization]);

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

  const onScheduleSelect = (appointment) => {
    setSelectedAppointment(appointment);
    setIsChoose(false);
    notify();
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Pending" ||
      appointment.status === "Accepted" ||
      appointment.status === "Schedule Change Request" ||
      appointment.status === "Temporary Reschedule Request" ||
      appointment.status === "Rejected" ||
      appointment.status === "Temporarily Rescheduled"
  );

  return (
    <>
      {/* Book Appointment Modal */}
      {isOpen && (
        <JoinAppointment
          openModal={handleModal}
          selectedClinician={selectedClinician}
          selectedSchedule={selectedSchedule}
          patientId={patientData?._id}
          closeModal={closeModal} // Pass the closeModal function
          onWebSocket={webSocketNotification}
        />
      )}

      {/* RESCHEDULE PAGE 1 MODAL */}
      {isConfirm && (
        <ConfirmReschedule
          onClick={closeConfirmModal}
          closeModal={closeConfirmModal}
          openResched={() => setIsChoose(true)}
          appointment={appointmentToReschedule} // Pass the appointment details
        />
      )}

      {/* RESCHEDULE PAGE 2 MODAL */}
      {isChoose && (
        <ChooseSchedule
          closeModal={closeChooseScheduleModal}
          clinicianId={clinicianIdForReschedule}
          onScheduleSelect={onScheduleSelect}
          appointment={appointmentToReschedule} // Pass the appointment details
          onWebSocket={webSocketNotification}
          patientName={`${patientData?.firstName} ${patientData?.lastName}`}
        />
      )}

      {isTemporaryReschedule && (
        <TemporaryRescheduleConfirmation
          closeModal={() => setIsTemporaryReschedule(false)}
          openTemporarySchedule={openTemporaryScheduleModal} // Pass the new function
          appointment={appointmentToReschedule}
        />
      )}

      {isTemporarySchedule && (
        <TemporarySchedule
          closeModal={closeTemporaryScheduleModal}
          clinicianId={clinicianIdForReschedule}
          onScheduleSelect={onScheduleSelect}
          appointment={appointmentToReschedule}
          onWebSocket={webSocketNotification}
          patientName={`${patientData?.firstName} ${patientData?.lastName}`}
        />
      )}

      {isViewAppointment && (
        <PatientViewAppointment
          openModal={handleAppointmentClick}
          appointment={selectedAppointment}
          closeModal={closeViewAppointmentModal}
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
                ) : patientData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {patientData?.firstName} {patientData?.lastName}
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
                    <p className="mb-0 fw-bold">Book an Appointment</p>
                    <p className="mb-0">
                      Select a specialization and a date to view available
                      clinician schedules.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <div className="mb-3 d-flex flex-column gap-3 flex-nowrap">
                      <select
                        className="form-select form-select-lg mb-3"
                        aria-label="form-select-lg example"
                        value={selectedSpecialization}
                        onChange={handleSpecializationChange}
                      >
                        <option value="default" selected>
                          All Specializations
                        </option>
                        <option value="Autism Spectrum Disorder">
                          Autism Spectrum Disorder
                        </option>
                        <option value="Attention-Deficit Hyperactivity Disorder">
                          Attention-Deficit Hyperactivity Disorder
                        </option>
                        <option value="Global Developmental Delay">GDD</option>
                        <option value="Cerebral Palsy">Cerebral Palsy</option>
                        <option value="Down Syndrome">Down Syndrome</option>
                        <option value="Hearing Impairment">
                          Hearing Impairment
                        </option>
                        <option value="Cleft Lip and/or Palate">
                          Cleft Lip and/or Palate
                        </option>
                        <option value="Stroke">Stroke</option>
                        <option value="Stuttering">Stuttering</option>
                        <option value="Aphasia">Aphasia</option>
                        <option value="Others">Others</option>
                      </select>

                      <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        inline
                        dayClassName={getDayClassName}
                        minDate={new Date()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">List of Schedules</p>
                    <p className="mb-0">
                      You are allowed to book one appointment at a time.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {getAllSchedulesForSelectedDay.length === 0 ? (
                      <h5 className="mb-0 fw-bold text-center">
                        No appointments available for the selected date.
                      </h5>
                    ) : (
                      getAllSchedulesForSelectedDay.map((schedule, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-start align-items-center w-100 px-4 py-3 mb-3 border-bottom border-top rounded-3"
                        >
                          <div className="w-100">
                            <h5 className="fw-bold d-flex gap-2 align-items-center">
                              {schedule.startTime} - {schedule.endTime}{" "}
                              <p className="fw-medium mb-0 status-booked">
                                {schedule.status}
                              </p>
                            </h5>
                            <p className="mb-0">
                              <FontAwesomeIcon icon={faCalendar} />{" "}
                              {schedule.day}
                            </p>
                            <p className="mb-0">
                              <FontAwesomeIcon icon={faStethoscope} size="xs" />{" "}
                              {schedule.clinicianName}
                            </p>
                            <p className="">
                              <FontAwesomeIcon icon={faUserDoctor} />{" "}
                              {schedule.specialization}
                            </p>

                            <p className="mb-0 my-2">
                              <FontAwesomeIcon icon={faLocationDot} />{" "}
                              {schedule.address}
                            </p>
                            <p className="mb-0">
                              <FontAwesomeIcon icon={faPhone} />{" "}
                              {schedule.contact}
                            </p>
                            <p className="mb-0">
                              <FontAwesomeIcon icon={faEnvelope} />{" "}
                              {schedule.email}
                            </p>
                          </div>
                          {schedule.status !== "Booked" && !hasBooked && (
                            <div
                              className="mb-3 fw-bold text-button border"
                              onClick={() =>
                                handleModal(schedule.clinicianId, schedule._id)
                              }
                            >
                              Book
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* THIRD COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Your Appointments</p>
                    <p className="mb-0">View the status of your appointment.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {filteredAppointments.length === 0 ? (
                      <h5 className="mb-0 fw-bold text-center">
                        You do not have any appointments available.
                      </h5>
                    ) : (
                      filteredAppointments.map((appointment, index) => (
                        <div
                          key={index}
                          className="mb-3 border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="mb-0 fw-bold">
                            {appointment.status === "Schedule Change Request"
                              ? appointment.newSchedule.day
                              : appointment.status ===
                                  "Temporary Reschedule Request" ||
                                appointment.status === "Temporarily Rescheduled"
                              ? appointment.temporaryReschedule.day
                              : appointment.selectedSchedule.day}
                          </h5>
                          <p className="fw-bold mb-0">
                            {appointment.status === "Schedule Change Request"
                              ? `${appointment.newSchedule.startTime} - ${appointment.newSchedule.endTime}`
                              : appointment.status ===
                                  "Temporary Reschedule Request" ||
                                appointment.status === "Temporarily Rescheduled"
                              ? `${appointment.temporaryReschedule.startTime} - ${appointment.temporaryReschedule.endTime}`
                              : `${appointment.selectedSchedule.startTime} - ${appointment.selectedSchedule.endTime}`}
                          </p>
                          <h6 className="mb-2">
                            Session with{" "}
                            <span className="fw-bold">
                              {appointment.status === "Schedule Change Request"
                                ? appointment.newSchedule.clinicianName
                                : appointment.status ===
                                    "Temporary Reschedule Request" ||
                                  appointment.status ===
                                    "Temporarily Rescheduled"
                                ? appointment.temporaryReschedule.clinicianName
                                : appointment.selectedSchedule.clinicianName}
                            </span>
                          </h6>
                          <a
                            href="#"
                            className="text-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAppointmentClick(appointment);
                            }}
                          >
                            View Appointment Details
                          </a>
                          {/* IF PENDING */}
                          {appointment.status === "Pending" && (
                            <div className="row mt-2">
                              <div className="d-flex justify-content-between flex-wrap gap-3">
                                <div className="mb-3 text-pending">PENDING</div>
                                <div className="d-flex gap-3">
                                  <div
                                    className="mb-3 fw-bold text-button border"
                                    hidden
                                  >
                                    Edit
                                  </div>
                                  <div
                                    className="mb-3 fw-bold text-button border"
                                    hidden
                                  >
                                    Cancel
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* IF ACCEPTED */}
                          {appointment.status === "Accepted" && (
                            <div className="row p-2 gap-3">
                              <div
                                className="mb-3 fw-bold text-button border"
                                onClick={() =>
                                  joinMeeting(appointment.roomId, appointment)
                                }
                              >
                                Join
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                onClick={() =>
                                  openConfirmRescheduleModal(appointment)
                                }
                              >
                                Change
                              </div>
                              <div
                                className="mb-3 fw-bold text-button border"
                                onClick={() =>
                                  openTemporaryRescheduleModal(appointment)
                                }
                              >
                                Reschedule
                              </div>
                            </div>
                          )}
                          {/* IF SCHEDULE CHANGE REQUEST */}
                          {appointment.status === "Schedule Change Request" && (
                              <div className="my-3 text-pending">
                                FOR APPROVAL
                              </div>
                          )}
                          {/* IF TEMPORARY RESCHEDULE REQUEST */}
                          {appointment.status ===
                            "Temporary Reschedule Request" && (
                              <div className="my-3 text-pending">
                                FOR APPROVAL
                              </div>
                          )}
                          {/* IF TEMPORARILY RESCHEDULED */}
                          {appointment.status === "Temporarily Rescheduled" && (
                            <div className="row p-2 gap-3">
                              <div
                                className="mb-3 fw-bold text-button border"
                                onClick={() =>
                                  joinMeeting(appointment.roomId, appointment)
                                }
                              >
                                Join
                              </div>
                            </div>
                          )}
                          {/* IF REJECTED */}
                          {appointment.status === "Rejected" && (
                              <div className="my-3 text-cancelled">
                                Rejected
                              </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
