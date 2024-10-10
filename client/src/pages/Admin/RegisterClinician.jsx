import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarSuper";

// Icons
import Sort from "../../assets/icons/Sort";

export default function RegisterClinician() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const appURL = import.meta.env.VITE_APP_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${appURL}/${route.clinician.addClinician}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(true);
        setMessage(data.message);
      } else {
        setError(false);
        setMessage(data.message);
        setEmail(""); // Clear the input field on success
      }
    } catch (err) {
      setError(true);
      setMessage("An error occurred. Please try again.");
    }
  };

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
              <p className="m-0 fw-bold">Cyril Filomeno</p>
            </div>
          </Row>

          {/* TOTAL ADMINS */}
          <Row
            lg
            md
            className="total-admin border border-1 my-2 border-[#B9B9B9] card-content-bg-light p-2 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-none d-lg-block">
                  <p className="m-0">3</p>
                  <p className="m-0 fw-bold">Total Clinicians</p>
                </div>

                <button className="action-btn">Register Admin</button>
              </div>

              <Sort />
            </div>
          </Row>

          <Row lg md>
            {/* YOUR PROFILE */}
            <Col lg className="height-responsive">
              {/* USER LIST */}
              <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                <div className="d-flex flex-column g-1 mb-2">
                  <form className="p-3" onSubmit={handleSubmit}>
                    <h3 className="mt-4">Credentials</h3>
                    <div className="form-group">
                      <p className="mb-0">Email Address</p>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <p className="my-3">
                      Enter the email of authorized clinician
                    </p>

                    <button
                      type="submit"
                      className="action-btn btn-text-blue btn-primary"
                    >
                      Create
                    </button>
                  </form>
                  {message && (
                    <div
                      className={`alert ${
                        error ? "alert-danger" : "alert-success"
                      }`}
                      role="alert"
                    >
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </Col>
            <Col lg />
            <Col lg />
          </Row>
        </Col>
      </Row>
    </div>
  );
}
