import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";

// Icons
import Sort from "../../assets/icons/Sort";
import Search from "../../assets/icons/Search";

export default function ViewContent() {
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClinicianData = async () => {
      const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

      try {
        const response = await fetch(
          "http://localhost:8000/clinicianSLP/get-clinician",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the Bearer token in the headers
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch clinician data");
        }

        const data = await response.json();
        setClinicianData(data.clinician);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchClinicianData();
  }, []);

  return (
    <Container>
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
              <p className="m-0 fw-bold">
                {clinicianData?.firstName || "Clinician"}
              </p>
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
                <div className="m-auto">
                  <h4 className="fw-bold mb-0">Exercises</h4>
                </div>

                <div className="d-flex align-items-center gap-2 search-bar d-none d-lg-block">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search for content"
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
            {/* PATIENTS */}
            <Col lg className="height-responsive">
              {/* CONTENT LIST */}
              <div className="card-container d-flex flex-wrap align-items-center justify-content-start flex-row gap-3 scrollable-div-5 notif-home">
                <div className="card-content-bg-dark content-card">
                  {/* IMAGE COMPONENT */}
                  <div className="p-3">
                    <div className="profile-img">
                      <img src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="fw-bold mb-0">Video Title</h5>
                    <h5 className="mb-0">Speech exercise description</h5>
                    <p>Category</p>
                  </div>
                </div>

                <div className="card-content-bg-dark content-card">
                  {/* IMAGE COMPONENT */}
                  <div className="p-3">
                    <div className="profile-img">
                      <img src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="fw-bold mb-0">Video Title</h5>
                    <h5 className="mb-0">Speech exercise description</h5>
                    <p>Category</p>
                  </div>
                </div>

                <div className="card-content-bg-dark content-card">
                  {/* IMAGE COMPONENT */}
                  <div className="p-3">
                    <div className="profile-img">
                      <img src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="fw-bold mb-0">Video Title</h5>
                    <h5 className="mb-0">Speech exercise description</h5>
                    <p>Category</p>
                  </div>
                </div>

                <div className="card-content-bg-dark content-card">
                  {/* IMAGE COMPONENT */}
                  <div className="p-3">
                    <div className="profile-img">
                      <img src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="fw-bold mb-0">Video Title</h5>
                    <h5 className="mb-0">Speech exercise description</h5>
                    <p>Category</p>
                  </div>
                </div>

                <div className="card-content-bg-dark content-card">
                  {/* IMAGE COMPONENT */}
                  <div className="p-3">
                    <div className="profile-img">
                      <img src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="fw-bold mb-0">Video Title</h5>
                    <h5 className="mb-0">Speech exercise description</h5>
                    <p>Category</p>
                  </div>
                </div>

                <div className="card-content-bg-dark content-card">
                  {/* IMAGE COMPONENT */}
                  <div className="p-3">
                    <div className="profile-img">
                      <img src="https://i.pinimg.com/736x/bb/41/fd/bb41fd264ef0b1248387c53048137bb5.jpg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="fw-bold mb-0">Video Title</h5>
                    <h5 className="mb-0">Speech exercise description</h5>
                    <p>Category</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
