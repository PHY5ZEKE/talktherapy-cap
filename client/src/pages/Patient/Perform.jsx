import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";

// Icons
import Back from "../../assets/icons/Back";
import BookmarkHollow from "../../assets/icons/BookmarkHollow";
export default function Perform() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin data from the backend
  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(
          "http://localhost:8000/patient-SLP/get-patient",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
            },
          }
        );

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
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col xs={{ order: 12 }} lg={{ order: 1 }}>
          {/* TOP BAR */}
          <Row
            lg
            md
            className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center"
          >
            <div>
              <p className="m-0">Hello,</p>
              <p className="m-0 fw-bold">{patientData?.firstName || "Admin"}</p>
            </div>
          </Row>

          <Row lg md>
            {/* YOUR PROFILE */}
            <Col lg className="height-responsive full-height">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <Back />
                <h4 className="fw-bold my-0 mx-0 card-text">Exercise Title</h4>
                <BookmarkHollow />
              </div>

              <div className="card-container d-flex flex-column gap-2 notif-home">
                {/* IMAGE COMPONENT */}
                <div className="p-3">
                  <div className="exercise-vid">
                    <video src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    <div className="progress-pos">
                      <progress value="32" max="100">
                        32%
                      </progress>
                    </div>
                  </div>
                </div>

                {/* VIDEO COMPONENT */}
                <div className="d-flex flex-column g-1 mb-2 mx-3">
                  <h4 className="fw-bold mb-0">Exercise Title</h4>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    eget fermentum torto r. Nulla facilisi. Maecenas hendrerit
                    feugiat finibus. Mauris nec diam at risus ullamcorper
                    pellentesque quis a mauris. Suspendisse id sagittis dolor.
                    Vivamus tristique tempus leo, sed consectetur ante consequat
                    eu. Nulla feugiat nisi sed sapien sodales iaculis. Cras
                    imperdiet turpis massa, id dapibus nulla congue vitae. Morbi
                    lacus turpis, pellentesque quis velit non, varius luctus
                    est. Praesent mollis turpis et venenatis placerat. Etiam
                    tempor faucibus magna, in fringilla metus consectetur eget.
                    Nam eleifend ex lectus, vel vulputate sem malesuada vel.
                    Suspendisse vel diam ac nunc sagittis volutpat. Suspendisse
                    potenti. Aliquam ac molestie sapien. Nam eros tellus,
                    pulvinar nec nisi eu, luctus tristique ligula.
                  </p>
                  <p className="mb-0">Category</p>
                </div>
              </div>
            </Col>

            {/* ACTIONS */}
            <Col lg className="height-responsive">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">
                  Perform Exercise
                </h4>
              </div>

              <div className="card-container d-flex justify-content-center align-items-center flex-column gap-2 scrollable-div notif-home">
                <div className="local-video">
                  <video></video>
                </div>
                <button className="button-group bg-white">
                  <p className="fw-bold my-0 status">PERFORM</p>
                </button>

                <div className="card-container p-3 w-75">
                  <p className="mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    eget fermentum torto r. Nulla facilisi. Maecenas hendrerit
                    feugiat finibus. Mauris nec diam at risus ullamcorper
                    pellentesque quis a mauris. Suspendisse id sagittis dolor.
                    Vivamus tristique tempus leo, sed consectetur ante consequat
                    eu.
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
