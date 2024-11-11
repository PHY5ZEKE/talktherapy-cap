import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

export default function Perform() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  // Fetch admin data from the backend
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
                    {/* TITLE */}
                    <p className="mb-0 fw-bold">Video Title Here</p>
                    <p className="mb-0">Category</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3 overflow-auto">
                    {/* TO DO: CHANGE DEPENDING ON INPUT AND TYPE OF EXXERCISE */}
                    <div className="w-100 bg-warning exercise-vid rounded-2"></div>
                    <p className="mb-0">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed eget fermentum torto r. Nulla facilisi. Maecenas
                      hendrerit feugiat finibus. Mauris nec diam at risus
                      ullamcorper pellentesque quis a mauris. Suspendisse id
                      sagittis dolor. Vivamus tristique tempus leo, sed
                      consectetur ante consequat eu. Nulla feugiat nisi sed
                      sapien sodales iaculis. Cras imperdiet turpis massa, id
                      dapibus nulla congue vitae. Morbi lacus turpis,
                      pellentesque quis velit non, varius luctus est. Praesent
                      mollis turpis et venenatis placerat. Etiam tempor faucibus
                      magna, in fringilla metus consectetur eget. Nam eleifend
                      ex lectus, vel vulputate sem malesuada vel. Suspendisse
                      vel diam ac nunc sagittis volutpat. Suspendisse potenti.
                      Aliquam ac molestie sapien. Nam eros tellus, pulvinar nec
                      nisi eu, luctus tristique ligula.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Perform</p>
                    <p className="mb-0">Practice and folllow along.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <div className="mb-3">
                      <div className="mb-3">
                        {/* VIDEO CAM */}
                        <video className="w-100 h-75 bg-warning"></video>
                      </div>

                      {/* BUTTON */}
                      <div
                        className="mb-3 fw-bold text-button border mx-auto"
                        style={{ cursor: "pointer" }}
                      >
                        Perform
                      </div>
                      {/* PERFORMANCE */}
                      <p className="mb-3 w-100 bg-secondary-subtle text-center p-3 rounded-2">
                        
                      </p>
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
