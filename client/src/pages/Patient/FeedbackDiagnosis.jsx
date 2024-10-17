import { useState, useEffect } from "react";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

export default function FeedbackDiagnosis() {
  const appURL = import.meta.env.VITE_APP_URL;

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <div className="col-sm-4 bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Feedback and Diagnosis</p>
                    <p className="mb-0">Your performance and diagnosis.</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <div
                      className="mb-3 border border border-top-0 border-start-0 border-end-0 hover-div"
                      style={{ cursor: "pointer" }}
                    >
                      <h5 className="mb-0 fw-bold">Dr. Juan Dela Cruz</h5>
                      <p className="mb-0 fw-bold">Diagnosis</p>
                      <p className="mb-3">July 4, 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECOND COL */}
              <div className="col-sm-8 bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <p className="mb-0 fw-bold">Search</p>
                    <p className="mb-0">
                      .
                    </p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh"}}
                  >
                    <div className="mb-3">
                      <h4 className="mb-0 fw-bold">Diagnosis</h4>
                      <p className="mb-0">Prescription by</p>
                      <p className="mb-3">July 4, 2024</p>
                      <p className="text-justify">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed eget fermentum torto r. Nulla facilisi. Maecenas
                        hendrerit feugiat finibus. Mauris nec diam at risus
                        ullamcorper pellentesque quis a mauris. Suspendisse id
                        sagittis dolor. Vivamus tristique tempus leo, sed
                        consectetur ante consequat eu. Nulla feugiat nisi sed
                        sapien sodales iaculis. Cras imperdiet turpis massa, id
                        dapibus nulla congue vitae. Morbi lacus turpis,
                        pellentesque quis velit non, varius luctus est. Praesent
                        mollis turpis et venenatis placerat. Etiam tempor
                        faucibus magna, in fringilla metus consectetur eget. Nam
                        eleifend ex lectus, vel vulputate sem malesuada vel.
                        Suspendisse vel diam ac nunc sagittis volutpat.
                        Suspendisse potenti. Aliquam ac molestie sapien. Nam
                        eros tellus, pulvinar nec nisi eu, luctus tristique
                        ligula.
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
