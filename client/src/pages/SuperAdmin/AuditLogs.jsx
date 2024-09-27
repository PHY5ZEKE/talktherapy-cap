import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState, useEffect } from "react";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";

import Calendar from "../../assets/icons/Calendar";
import Sort from "../../assets/icons/Sort";
export default function AuditLogs() {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [error, setError] = useState(null);

  //Super Admin
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      const token = localStorage.getItem("accessToken"); // Retrieve the token from localStorage

      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/super-admin/get-super-admin", // Ensure this URL is correct
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

  return (
    <Container>
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
                    <div className="col fw-bold">Friday, July 5, 2024</div>
                    <div className="col">
                      <Calendar />
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
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>

                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 5, 2024</th>
                      <td>Mark</td>
                      <td>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industrys
                        standard dummy text ever since the 1500s, when an
                        unknown printer took a galley of type and scrambled it
                        to make a type specimen book.
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">July 2, 2024</th>
                      <td>Jacob</td>
                      <td colSpan="3">Thornton</td>
                    </tr>
                    <tr>
                      <th scope="row">July 6, 2024</th>
                      <td>Jacob</td>
                      <td>July 6, 2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
