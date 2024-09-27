import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

// CSS
import "./profile.css";
import "./manage-patients.css";

import Search from "../../assets/icons/Search";
import Sort from "../../assets/icons/Sort";

// Components
import Sidebar from "../../components/Sidebar/AdminSidebar";

export default function ManagePatients() {
  return (
    <Container fluid>
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* CONTENT */}
        <Col
          xs={{ order: 12 }}
          lg={{ order: 1 }}
          className="d-flex flex-column stretch-flex"
        >
          {/* TOP BAR */}
          <Row className="border border-start-0 border-[#B9B9B9] p-2 d-flex justify-content-center align-items-center">
            <div>
              <p className="m-0">Welcome,</p>
              <p className="m-0 fw-bold">Admin</p>
            </div>
          </Row>

          {/* SEARCH PATIENTS */}
          <Row
            lg
            md
            className="search-patients border border-1 my-2 border-[#B9B9B9] card-content-bg-light p-3 d-flex justify-content-between align-items-center mx-auto"
          >
            <div className="d-flex align-items-center">
              <h5 className="m-0 fw-bold">Search Patients</h5>

              <div className="search-bar-container ms-3">
                <Form className="d-flex">
                  <span className="search-icon-container">
                    <Search className="search-icon" />
                  </span>
                  <Form.Control
                    type="search"
                    placeholder="Search Admin..."
                    className="search-bar me-2"
                    aria-label="Search"
                  />
                </Form>
              </div>

              <Sort className="ms-3" />
            </div>
          </Row>

          {/* MAIN CONTENT */}
          <Row>
            {/* YOUR PROFILE */}
            <Col lg={4} className="height-responsive">
              <div className="card-container d-flex justify-content-center align-items-center flex-column gap-2 scrollable-div notif-home">
                <div className="patient-container d-flex flex-column">
                  <p className="mb-0 fw-bold">Patient</p>
                  <p className="mb-0">09913864313</p>
                  <p className="mb-0">sandy@gmail.com</p>
                </div>
                <div className="patient-container d-flex flex-column">
                  <p className="mb-0 fw-bold">Patient</p>
                  <p className="mb-0">09913864313</p>
                  <p className="mb-0">sandy@gmail.com</p>
                </div>
              </div>
            </Col>
            {/* ACTIONS */}
            <Col lg={8} className="height-responsive">
              <div className="card-container d-flex flex-column gap-2 scrollable-div notif-home">
                {/* IMAGE COMPONENT */}
                <div className="p-3">
                  <div className="profile-img">
                    <img
                      src="https://smiski.com/e/wp-content/uploads/2016/03/about01.png"
                      alt="Profile"
                    />
                  </div>
                </div>
                {/* PROFILE DETAILS */}
                <div className="d-flex flex-column g-1 mb-2 mx-3">
                  <h3 className="fw-bold mb-0">Cassandra Cortez</h3>
                  <p className="mb-0">Camella Provence</p>
                  <p className="mb-0">09913864313</p>
                  <p className="mb-0">sandy@gmail.com</p>
                </div>
                <div className="d-flex flex-column mb-2 ms-2">
                  <button className="action-btn mb-2">View Records</button>
                  <button className="action-btn">Archive</button>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
