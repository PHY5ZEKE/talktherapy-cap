import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { route } from "../../utils/route";
// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";

// Icons
import Sort from "../../assets/icons/Sort";
import Edit from "../../assets/icons/Edit";
import Delete from "../../assets/icons/Delete";
import Search from "../../assets/icons/Search";

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
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-stretch"
        >
          {/* TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">{adminData?.firstName || "Admin"}</p>
            </div>
          </Row>

          {/* TOAL ADMINS */}
          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-flex justify-content-center align-items-center">
                  <p className="m-0 fw-bold">Manage Schedule</p>
                </div>

                <div className="d-flex align-items-center gap-2 search-bar d-none d-lg-block">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search for clinician"
                    className="search-input"
                  />
                </div>
              </div>

              <Sort />
            </div>
          </Row>

          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto d-sm-block d-lg-none"
          >
            <div className="admin-left d-flex justify-content-center">
              <div className="d-flex align-items-center gap-2 search-bar">
                <Search />
                <input
                  type="text"
                  placeholder="Search for content"
                  className="search-input"
                />
              </div>
            </div>
          </Row>

          <Row lg md>
            {/* CLINICIAN LIST */}
            <Col lg className="height-responsive">
              {/* CONTENT LIST */}
              <div className="card-container d-flex flex-wrap align-items-center flex-row gap-3 scrollable-div-5 notif-home">
                {clinicians && clinicians.length > 0 ? (
                  clinicians.map((clinician) => (
                    <div
                      key={clinician._id}
                      className="card-content-bg-dark w-100 p-3"
                    >
                      <div className="d-flex flex-column g-1 mb-2">
                        <p className="fw-bold mb-0">
                          {clinician.firstName} {clinician.middleName}{" "}
                          {clinician.lastName}
                        </p>
                        <p className="mb-0">{clinician.clinicAddress}</p>
                        <p className="mb-0">{clinician.contactNumber}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No clinicians available.</p>
                )}
              </div>
            </Col>

            {/* CALENDAR */}
            <Col lg>
              <div className="w-100 d-flex justify-content-center">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  inline
                />
              </div>
            </Col>

            {/* PREVIEW SCHEDULE */}
            <Col lg>
              <div className="card-container d-flex flex-wrap align-items-center flex-row scrollable-div-5 notif-home">
                <div className="p-3 w-100">
                  <h4 className="fw-bold mb-0">Keila Santiagos Schedule</h4>
                  <p className="mb-0">July 4, 2024</p>
                </div>

                <div className="d-flex justify-content-around align-items-center w-100 p-2 border-top border-bottom">
                  <div className="w-50">
                    <h5 className="fw-bold mb-0">12:30 PM - 1:30 PM</h5>
                    <p>July 4, 2024</p>
                    <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                      <Edit />
                      <Delete />
                    </div>
                  </div>
                  <p className="status-accepted status-text status-text-green text-center">
                    PENDING
                  </p>
                </div>

                <div className="d-flex justify-content-around align-items-center w-100 p-2 border-top border-bottom">
                  <div className="w-50">
                    <h5 className="fw-bold mb-0">12:30 PM - 1:30 PM</h5>
                    <p>July 4, 2024</p>
                    <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                      <Edit />
                      <Delete />
                    </div>
                  </div>
                  <p className="status-accepted status-text status-text-green text-center">
                    PENDING
                  </p>
                </div>
                <div className="d-flex justify-content-around align-items-center w-100 p-2 border-top border-bottom">
                  <div className="w-50">
                    <h5 className="fw-bold mb-0">12:30 PM - 1:30 PM</h5>
                    <p>July 4, 2024</p>
                    <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                      <Edit />
                      <Delete />
                    </div>
                  </div>
                  <p className="status-accepted status-text status-text-green text-center">
                    PENDING
                  </p>
                </div>
                <div className="d-flex justify-content-around align-items-center w-100 p-2 border-top border-bottom">
                  <div className="w-50">
                    <h5 className="fw-bold mb-0">12:30 PM - 1:30 PM</h5>
                    <p>July 4, 2024</p>
                    <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                      <Edit />
                      <Delete />
                    </div>
                  </div>
                  <p className="status-accepted status-text status-text-green text-center">
                    PENDING
                  </p>
                </div>
                <div className="d-flex justify-content-around align-items-center w-100 p-2 border-top border-bottom">
                  <div className="w-50">
                    <h5 className="fw-bold mb-0">12:30 PM - 1:30 PM</h5>
                    <p>July 4, 2024</p>
                    <div className="button-group d-flex justify-content-center flex-row gap-2 bg-white">
                      <Edit />
                      <Delete />
                    </div>
                  </div>
                  <p className="status-accepted status-text status-text-green text-center">
                    PENDING
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
