import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";

// DatePicker
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ManageSchedule() {
  // DatePicker Instance
  const [startDate, setStartDate] = useState(new Date());
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinicians, setClinicians] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  // Fetch admin data from the backend
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(`${appURL}/${route.admin.fetch}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const data = await response.json();
        setAdminData(data.admin);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
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
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = await response.json();

        if (!data.error) {
          console.log(data.clinicians)
          setClinicians(data.clinicians);
        } else {
          console.error("Failed to fetch clinicians:", data.message);
        }
      } catch (error) {
        console.error("Error fetching clinicians:", error);
      }
    };

    fetchClinicians();
  }, []);

  return (
    <>
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

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Pick a Date</p>
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
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <select
                        className="form-select form-select-lg mb-3"
                        aria-label=".form-select-lg example"
                      >
                        <option value="" disabled selected>
                          Specialization
                        </option>
                        <option value="Aphasia">Aphasia</option>
                        <option value="Stroke">Stroke</option>
                      </select>

                      <DatePicker selected={startDate} inline />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">List of Clinicians</p>
                    <p className="mb-0">
                      Click a clinician to view their schedule.
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
                        >
                          <div className="w-100">
                            <h5 className="fw-bold mb-0">
                              {clinician.firstName} {clinician.middleName}{" "}
                              {clinician.lastName}
                            </h5>
                            <h6 className="fw-bold mb-0">
                              {clinician.address}
                            </h6>
                            <p className="mb-0">{clinician.email}</p>
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
                    <div className="mb-3 border border border-top-0 border-start-0 border-end-0">
                      <h5 className="mb-0 fw-bold">DAY</h5>
                      <p className="fw-bold mb-0">TIME</p>
                      <p className=" mb-0">
                        Session with{" "}
                        <span className="fw-bold">clinician name</span>
                      </p>
                      <p>Status: </p>
                    </div>
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
