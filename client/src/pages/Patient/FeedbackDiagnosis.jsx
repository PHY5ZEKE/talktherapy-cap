import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { route } from "../../utils/route";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";

// Icons
import Sort from "../../assets/icons/Sort";
import Edit from "../../assets/icons/Edit";
import Delete from "../../assets/icons/Delete";
import Search from "../../assets/icons/Search";

// DatePicker
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FeedbackDiagnosis() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // DatePicker Instance
  const [startDate, setStartDate] = useState(new Date());
  const appURL = import.meta.env.VITE_APP_URL;

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(`${appURL}/${route.patient.fetch}`, {
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
              <p className="m-0 fw-bold">{patientData?.firstName || "Admin"}</p>
            </div>
          </Row>

          {/* 2ND HEADER */}
          <Row
            lg
            md
            className="total-admin border border-1 my-3 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-center align-items-center mx-auto"
          >
            <div className="admin-left d-flex justify-content-between">
              <div className="admin-child d-flex gap-3">
                <div className="d-flex justify-content-center align-items-center">
                  <p className="m-0 fw-bold">Feedbacks and Diagnosis</p>
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
                  placeholder="Search"
                  className="search-input"
                />
              </div>
            </div>
          </Row>

          <Row lg md>
            {/* DIAGNOSIS FEEDBACK LIST */}
            <Col lg span={1} className="height-responsive">
              {/* CONTENT LIST */}
              <div className="card-container d-flex flex-wrap align-items-center flex-row gap-3 scrollable-div-5 notif-home">
                <div className="card-content-bg-dark w-100 p-3">
                  <div className="d-flex flex-column g-1 mb-2">
                    <p className="fw-bold mb-0">Dr. Juan Dela Cruz</p>
                    <p className="mb-0">Diagnosis</p>
                    <p className="mb-0">July 4, 2024</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg span={2}>
              <div className="card-container d-flex flex-wrap align-items-center flex-row gap-3 scrollable-div-5 notif-home">
                <div className="py-1 px-3">
                  <h4 className="fw-bold">Diagnosis Form</h4>
                  <p className="fst-italic mb-0">
                    Written and prescription by Dr. Juan Dela Cruz
                  </p>
                  <p>Date here</p>

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
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
