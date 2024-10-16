import { useState, useEffect } from "react";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/MenuDropdown";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

export default function ViewContent() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  // Fetch admin data from the backend
  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(`${appURL}/${route.patient.fetch}`, {
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
        setPatientData(data.patient);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPatientData();
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
                    <p className="mb-0 fw-bold">Exercises</p>
                    <p className="mb-0">View exercises and follow along.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="d-flex flex-wrap gap-3 bg-white border rounded-4 p-3 overflow-auto"
                    style={{ minHeight: "85vh" }}
                  >
                    <div className="card exercise-container" style={{ width: "18rem" }}>
                      <img
                        src="https://i.pinimg.com/control/564x/17/fc/ee/17fceea336518bcf86f94c1e56a05e4e.jpg"
                        className="card-img-top"
                        alt="..."
                        style={{height: "16rem", objectFit:"cover"}}
                      />
                      <div className="card-body">
                        <h5 className="card-title fw-bold mb-0 text-truncate">Example Long Title Here For Test</h5>
                        <p className="">Category</p>
                        <FontAwesomeIcon icon={faBookmark} />
                      </div>
                    </div>

                    <div className="card exercise-container" style={{ width: "18rem" }}>
                      <img
                        src="https://i.pinimg.com/control/564x/17/fc/ee/17fceea336518bcf86f94c1e56a05e4e.jpg"
                        className="card-img-top"
                        alt="..."
                        style={{height: "16rem", objectFit:"cover"}}
                      />
                      <div className="card-body">
                        <h5 className="card-title fw-bold mb-0 text-truncate">Example Long Title Here For Test</h5>
                        <p className="">Category</p>
                        <FontAwesomeIcon icon={faBookmark} />
                      </div>
                    </div>

                    <div className="card exercise-container" style={{ width: "18rem" }}>
                      <img
                        src="https://i.pinimg.com/control/564x/17/fc/ee/17fceea336518bcf86f94c1e56a05e4e.jpg"
                        className="card-img-top"
                        alt="..."
                        style={{height: "16rem", objectFit:"cover"}}
                      />
                      <div className="card-body">
                        <h5 className="card-title fw-bold mb-0 text-truncate">Example Long Title Here For Test</h5>
                        <p className="">Category</p>
                        <FontAwesomeIcon icon={faBookmark} />
                      </div>
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
