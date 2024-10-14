import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";
import Sort from "../../assets/icons/Sort";

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
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-flex"
        >
          {/* TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              {error && <p className="error">{error}</p>}
              {superAdmin ? (
                <p className="m-0 fw-bold">
                  Hello, {superAdmin.firstName} {superAdmin.lastName}
                </p>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </Row>

          {/* SYSTEM ACTIVITIES */}
          <Row
            lg
            md
            className="activity-top border border-1 my-2 border-[#B9B9B9] card-content-bg-light p-2 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="container">
              <div className="row">
                <div className="col d-flex align-items-center gap-3">
                  <h4 className="mb-0 fw-bold">System Activities</h4>
                </div>

                <div className="col">
                  <div className="row text-center d-flex align-items-center gap-3">
                    <div className="col fw-bold">
                      {selectedDate.toLocaleDateString()}
                    </div>
                    <div className="col">
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="yyyy/MM/dd"
                      />
                    </div>
                    <div className="col">
                      <Sort />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Row>

          <Row lg md>
            {/* YOUR PROFILE */}
            <Col lg className="height-responsive">
              <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                {/* TABLE NOTIFICATION*/}
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
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
