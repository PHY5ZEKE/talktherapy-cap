import { useState, useEffect } from "react";

// Calendar
import Icon from "../../assets/icons/CalendarIcon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";
import MenuDropdown from "../../components/Layout/MenuDropdown";

export default function AuditLogs() {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const appURL = import.meta.env.VITE_APP_URL;

  // Fetch Super Admin
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      const token = localStorage.getItem("accessToken"); // Retrieve the token from localStorage

      if (!token) {
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
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuperAdmin(data.superAdmin);
        } else if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch super admin data:", errorText);
          setError("Failed to fetch super admin data");
        }
      } catch (error) {
        console.error("Error fetching super admin data:", error);
        setError("Error fetching super admin data");
      }
    };

    fetchSuperAdmin();
  }, []);

  // Fetch Audit Logs
  const fetchAuditLogs = async (date) => {
    const token = localStorage.getItem("accessToken"); // Retrieve the token from localStorage

    if (!token) {
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch audit logs:", errorText);
        setError("Failed to fetch audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setError("Error fetching audit logs");
    }
  };

  useEffect(() => {
    fetchAuditLogs(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
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

                      <DatePicker
                        className="calendar text-center"
                        showIcon
                        selected={selectedDate}
                        onChange={handleDateChange}
                        icon={Icon}
                        dateFormat={"yyyy/MM/dd"}
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
