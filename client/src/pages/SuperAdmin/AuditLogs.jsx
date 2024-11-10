import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { useNavigate } from "react-router-dom";

// Calendar
import "react-datepicker/dist/react-datepicker.css";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";
import MenuDropdown from "../../components/Layout/SudoMenu";

export default function AuditLogs() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const nav = useNavigate();
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  // Fetch Super Admin
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      if (!accessToken) {
        clearOnLogOut();
        failNotify(toastMessage.fail.unauthorized);
        nav("/unauthorized");
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await fetch(
          `${appURL}/${route.sudo.fetch}`, // Ensure this URL is correct
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuperAdmin(data.superAdmin);
        } else if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
          clearOnLogOut();
          failNotify(toastMessage.fail.unauthorized);
          nav("/unauthorized");
        } else {
          const errorText = await response.text();
          failNotify(toastMessage.fail.error);
          failNotify(toastMessage.fail.fetch);
          setError("Failed to fetch data.", errorText);
        }
      } catch (error) {
        failNotify(toastMessage.fail.error);
        setError("Error in fetching data.", error);
      }
    };

    fetchSuperAdmin();
  }, []);

  // Fetch Audit Logs
  const fetchAuditLogs = async (date) => {
    if (!accessToken) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `${appURL}/${route.system.audit}?date=${date.toISOString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
      } else {
        const errorText = await response.text();
        failNotify(toastMessage.fail.fetch);
        setError("Failed to fetch audit logs", errorText);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);
      setError("Error fetching audit logs", error);
    }
  };

  useEffect(() => {
    fetchAuditLogs(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const filteredLogs = auditLogs.filter((log) => {
    const logDate = new Date(log.timestamp).toLocaleDateString();
    return logDate === selectedDate.toLocaleDateString();
  });

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
                ) : superAdmin ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {superAdmin.firstName} {superAdmin.lastName}
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
                    <div className="d-flex flex-wrap gap-3 justify-content-start">
                      <div>
                        <p className="mb-0 fw-bold">System Activities</p>
                        <p className="mb-0">
                          {selectedDate.toLocaleDateString()}
                        </p>
                      </div>

                      <input
                        aria-label="Date"
                        type="date"
                        name="birthday"
                        value={selectedDate.toISOString().split("T")[0]}
                        selected={selectedDate}
                        onChange={handleDateChange}
                        className="form-input rounded"
                      />

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
                          <th scope="col">Date</th>
                          <th scope="col">Time</th>
                          <th scope="col" style={{ width: "70%" }}>
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.length > 0 ? (
                          filteredLogs.map((log) => (
                            <tr key={log._id}>
                              <th scope="row">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </th>
                              <td>
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </td>
                              <td>{log.details}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No logs available for the selected date.
                            </td>
                          </tr>
                        )}
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
