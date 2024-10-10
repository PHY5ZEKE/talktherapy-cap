import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";

import Calendar from "../../assets/icons/Calendar";
import Sort from "../../assets/icons/Sort";
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
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">{adminData?.firstName || "Admin"}</p>
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
                  <h4 className="mb-0 fw-bold">Data Archival</h4>
                </div>

                <div className="col">
                  <div className="row text-center d-flex align-items-center gap-3">
                    <div className="col fw-bold">Friday, July 5, 2024</div>
                    <div className="col">
                      <Calendar />
                    </div>
                    <div className="col">
                      <Sort />
                    </div>
                    <div className="col">
                      <button className="action-btn2 btn-text-blue fw-bold mb-3">
                        Import
                      </button>
                      <button className="action-btn2 btn-text-blue fw-bold">
                        Archive Selected
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Row>

          <Row lg md>
            {/* YOUR PROFILE */}
            <Col lg className="height-responsive">
              <div className="table-responsive card-container d-flex flex-column gap-2 scrollable-div notif-home">
                {/* TABLE NOTIFICATION*/}
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
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
