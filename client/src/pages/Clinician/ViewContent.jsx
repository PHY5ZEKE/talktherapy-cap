import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";

export default function ViewContent() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

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
        setError(error.message);
        setLoading(false);
      }
    };

    fetchClinicianData();
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
