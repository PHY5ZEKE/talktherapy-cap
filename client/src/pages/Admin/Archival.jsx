import { useState, useEffect } from "react";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/MenuDropdown";

// Calendar
import Icon from "../../assets/icons/CalendarIcon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Archival() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
                    <div className="d-flex flex-wrap gap-3 align-items-center justify-content-start">
                      <div>
                        <p className="mb-0 fw-bold">System Activities</p>
                        <p className="mb-0">Date Here</p>
                      </div>

                      <DatePicker
                        className="calendar text-center"
                        showIcon
                        icon={Icon}
                        dateFormat={"yyyy/MM/dd"}
                      />

                      <div className="d-flex gap-3">
                        <button
                          className="fw-bold text-button border"
                          style={{ cursor: "pointer" }}
                        >
                          Import
                        </button>
                        <button
                          className="fw-bold text-button border"
                          style={{ cursor: "pointer" }}
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto"
                    style={{ maxHeight: "75vh" }}
                  >
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th scope="col">Last Active</th>
                          <th scope="col">Email Address</th>
                          <th scope="col">First Name</th>
                          <th scope="col">Last Name</th>
                          <th scope="col" style={{ width: "70" }}>
                            <button className="action-btn btn-text-blue">
                              Select All
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">July 5, 2024</th>
                          <td>Mark@gmail.com</td>
                          <td>Mark</td>
                          <td>Villar</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">July 5, 2024</th>
                          <td>Mark@gmail.com</td>
                          <td>Mark</td>
                          <td>Villar</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">July 5, 2024</th>
                          <td>Mark@gmail.com</td>
                          <td>Mark</td>
                          <td>Villar</td>
                          <td>
                            <input type="checkbox" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
