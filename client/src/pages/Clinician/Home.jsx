import { useNavigate } from "react-router-dom";
import axios from "axios";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";

// Modal
import ConfirmReschedule from "../../components/Modals/ConfirmReschedule";
import ChooseSchedule from "../../components/Modals/ChooseSchedule";
import AppointmentDetailsClinician from "../../components/Modals/AppointmentDetailsClinician";

// React
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

const appURL = import.meta.env.VITE_APP_URL;

export default function Home() {
  const { authState, setUserState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [appointments, setAppointments] = useState([]);
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();

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

  // Handle Confirm Reschedule Modal
  const [isConfirm, setIsConfirm] = useState(false);
  const openConfirmModal = () => {
    setIsConfirm(true);
  };
  const closeConfirmModal = () => {
    setIsConfirm(false);
  };

  // Handle Choose Schedule Modal
  const [isChoose, setIsChoose] = useState(false);
  const openChooseScheduleModal = () => {
    setIsChoose(true);
  };
  const closeChooseScheduleModal = () => {
    setIsChoose(false);
  };

  // Handle Appointment Details Modal
  const [isViewAppointment, setIsViewAppointment] = useState(false);
  const closeViewAppointmentModal = () => {
    setIsViewAppointment(false);
    setSelectedAppointment(null);
  };

  // Modal Information
  const openModal = async (appointmentId) => {
    try {
      const response = await axios.get(
        `${appURL}/${route.appointment.getById}/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSelectedAppointment(response.data);
      setIsViewAppointment(true);
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
    }
  };

  const joinMeeting = (id, details) => {
    navigate(`/room/${id}`, {
      state: {
        appointmentDetails: details,
      },
    });
  };

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
        setUserState(data.clinician._id);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchClinicianData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.appointment.getByClinician}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        failNotify(toastMessage.fail.fetch);
        failNotify(toastMessage.fail.error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <>
      {/* CONFIRM RESCHEDULE MODAL */}
      {isConfirm && (
        <ConfirmReschedule
          onClick={closeConfirmModal}
          closeModal={closeConfirmModal}
          openResched={openChooseScheduleModal}
        />
      )}

      {/* CHOOSE NEW SCHEDULE MODAL */}
      {isChoose && <ChooseSchedule closeModal={closeChooseScheduleModal} />}

      {/* VIEW APPOINTMENT DETAILS MODAL */}
      {isViewAppointment && (
        <AppointmentDetailsClinician
          openModal={closeViewAppointmentModal}
          appointment={selectedAppointment}
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
                    <p className="mb-0 fw-bold">Today is </p>
                    <p className="mb-0">Your Appointments</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {appointments
                      .filter(
                        (appointment) => appointment.status === "Accepted"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment._id}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="mb-0 fw-bold">
                            {appointment.selectedSchedule.day}
                          </h5>
                          <p className="mb-0 fw-bold">
                            {appointment.selectedSchedule.startTime} -{" "}
                            {appointment.selectedSchedule.endTime}
                          </p>
                          <p className="mb-3">
                            Scheduled appointment with{" "}
                            {appointment.patientId.firstName}{" "}
                            {appointment.patientId.lastName}
                          </p>
                          <a
                            href="#"
                            className="text-primary "
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(appointment._id);
                            }}
                          >
                            View Appointment Details
                          </a>

                          <div className="d-flex justify-content-between gap-1 mt-3">
                            <div className="mb-3 text-accepted">
                              {appointment.status}
                            </div>

                            <div className="d-flex flex-nowrap gap-1">
                              <button
                                className="mb-3 text-button border"
                                onClick={() =>
                                  joinMeeting(
                                    appointment.roomId,
                                    appointment
                                  )
                                }
                              >
                                Join
                              </button>
                              <button
                                className="mb-3 text-button border"
                                onClick={openConfirmModal}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {appointments
                      .filter(
                        (appointment) => appointment.status === "Completed"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment._id}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="mb-0 fw-bold">
                            {appointment.selectedSchedule.day}
                          </h5>
                          <p className="mb-0 fw-bold">
                            {appointment.selectedSchedule.startTime} -{" "}
                            {appointment.selectedSchedule.endTime}
                          </p>
                          <p className="mb-3">
                            Scheduled appointment with{" "}
                            {appointment.patientId.firstName}{" "}
                            {appointment.patientId.lastName}
                          </p>
                          <a
                            href="#"
                            className="text-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(appointment._id);
                            }}
                          >
                            View Appointment Details
                          </a>

                          <div className="my-3 text-accepted">
                            {appointment.status}
                          </div>
                        </div>
                      ))}
                    {appointments
                      .filter(
                        (appointment) =>
                          appointment.status === "Temporarily Rescheduled"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment._id}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="mb-0 fw-bold">
                            {appointment.temporaryReschedule.day}
                          </h5>
                          <p className="mb-0 fw-bold">
                            {appointment.temporaryReschedule.startTime} -{" "}
                            {appointment.temporaryReschedule.endTime}
                          </p>
                          <p className="mb-3">
                            Scheduled appointment with{" "}
                            {appointment.patientId.firstName}{" "}
                            {appointment.patientId.lastName}
                          </p>
                          <a
                            href="#"
                            className="text-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(appointment._id);
                            }}
                          >
                            View Appointment Details
                          </a>

                          <div className="my-3 text-accepted">
                            {appointment.status}
                          </div>
                        </div>
                      ))}
                    {appointments
                      .filter(
                        (appointment) =>
                          appointment.status === "Temporary Reschedule Request"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment._id}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="mb-0 fw-bold">
                            {appointment.temporaryReschedule.day}
                          </h5>
                          <p className="mb-0 fw-bold">
                            {appointment.temporaryReschedule.startTime} -{" "}
                            {appointment.temporaryReschedule.endTime}
                          </p>
                          <p className="mb-3">
                            {appointment.patientId.firstName}{" "}
                            {appointment.patientId.lastName} requested a
                            Temporary Schedule Change. This is subject for
                            approval.
                          </p>
                          <a
                            href="#"
                            className="text-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(appointment._id);
                            }}
                          >
                            View Appointment Details
                          </a>

                          <div className="my-3 text-pending">
                            {appointment.status}
                          </div>
                        </div>
                      ))}
                    {appointments
                      .filter(
                        (appointment) =>
                          appointment.status === "Schedule Change Request"
                      )
                      .map((appointment) => (
                        <div
                          key={appointment._id}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="mb-0 fw-bold">
                            {appointment.newSchedule.day}
                          </h5>
                          <p className="mb-0 fw-bold">
                            {appointment.newSchedule.startTime} -{" "}
                            {appointment.newSchedule.endTime}
                          </p>
                          <p className="mb-3">
                            {appointment.patientId.firstName}{" "}
                            {appointment.patientId.lastName} requested a
                            Schedule Change. This is subject for approval.
                          </p>
                          <a
                            href="#"
                            className="text-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(appointment._id);
                            }}
                          >
                            View Appointment Details
                          </a>

                          <div className="my-3 text-pending">
                            {appointment.status}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Notifications</p>
                    <p className="mb-0">
                      Account related notifications will appear here.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="mb-3 border border border-top-0 border-start-0 border-end-0"
                      >
                        <h5 className="mb-0 fw-bold">
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </h5>
                        <p className="mb-0 fw-bold">
                          {new Date(appointment.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="mb-3">
                          Session of Dr. {appointment.selectedClinician} with{" "}
                          {appointment.patientId.firstName}{" "}
                          {appointment.patientId.lastName} has started.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* THIRD COL */}
              <div className="col-sm bg-white"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
