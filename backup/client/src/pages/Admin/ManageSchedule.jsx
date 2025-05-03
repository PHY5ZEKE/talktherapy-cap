import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStethoscope } from "@fortawesome/free-solid-svg-icons";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";

// DatePicker
import "react-datepicker/dist/react-datepicker.css";

export default function ManageSchedule() {
  // DatePicker Instance
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinicians, setClinicians] = useState(null);
  const [selectedClinicianSchedule, setSelectedClinicianSchedule] = useState(
    []
  );
  const appURL = import.meta.env.VITE_APP_URL;

  const { authState } = useContext(AuthContext);

  const accessToken = authState.accessToken;

  const scheduleRef = useRef(null);

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

  // Fetch admin data from the backend
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch(`${appURL}/${route.admin.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
        });

        if (!response.ok) {
          setLoading(false);
          throw new Error("Failed to fetch admin data");
        }

        const data = await response.json();
        setAdminData(data.admin);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        throw new Error("Fetching admin data failed.", error);
      }
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    const fetchClinicians = async () => {
      try {
        const response = await fetch(
          `${appURL}/${route.admin.getAllClinicians}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (!data.error) {
          setClinicians(data.clinicians);
        } else {
          failNotify(toastMessage.fail.fetch);
          throw new Error("Fetching clinicians failed.", data.error);
        }
      } catch (error) {
        failNotify(toastMessage.fail.error);
        throw new Error("Fetching clinicians failed.", error);
      }
    };

    fetchClinicians();
  }, []);

  const fetchClinicianSchedule = async (clinicianId) => {
    try {
      const response = await fetch(`${appURL}/${route.schedule.clinician}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!data.error) {
        const clinicianSchedule = data.filter(
          (schedule) => schedule.clinicianId._id === clinicianId
        );
        setSelectedClinicianSchedule(clinicianSchedule);
        scheduleRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error(data);
        failNotify(toastMessage.fail.fetch);
        throw new Error("Fetching clinician schedule failed.", data.error);
      }
    } catch (error) {
      console.error(error);
      failNotify(toastMessage.fail.error);
      throw new Error("Fetching clinician schedule failed.", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="d-flex align-items-center justify-content-center vh-100">
  //       <div className="alert alert-danger" role="alert">
  //         {error}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">List of Clinicians</p>
                    <p className="mb-0">
                      Click a clinician to view their schedule block.
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    {clinicians && clinicians.length > 0 ? (
                      clinicians.map((clinician) => (
                        <div
                          key={clinician._id}
                          className="d-flex justify-content-start align-items-center w-100 p-2 border-top-0 border-bottom"
                          style={{ cursor: "pointer" }}
                          onClick={() => fetchClinicianSchedule(clinician._id)}
                        >
                          <div className="w-100">
                            <h5 className="fw-bold mb-0">
                              {clinician.firstName} {clinician.middleName}{" "}
                              {clinician.lastName}
                            </h5>
                            <h6 className="mb-2">
                              <FontAwesomeIcon icon={faStethoscope} size="sm" />{" "}
                              {clinician.specialization}
                            </h6>

                            <p className="mb-0">{clinician.email}</p>
                            <p className="mb-0">{clinician.address}</p>
                            <p className="mb-0">{clinician.mobile}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        No clinicians loaded.
                      </h5>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Clinician Schedule</p>
                    <p className="mb-0">Schedule of selected clinician.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <span ref={scheduleRef}></span>
                    {selectedClinicianSchedule.length > 0 ? (
                      selectedClinicianSchedule.map((schedule) => (
                        <div
                          key={schedule._id}
                          className="mb-3 border border border-top-0 border-start-0 border-end-0"
                        >
                          <h5 className="fw-bold mb-0">{schedule.day}</h5>
                          <p className="mb-0">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <p className="mb-0">{schedule.status}</p>
                        </div>
                      ))
                    ) : (
                      <h5 className="mb-0 fw-bold text-center">
                        No schedule available.
                      </h5>
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
