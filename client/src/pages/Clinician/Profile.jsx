import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap"; // Import Modal and Button

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";

// Utils
import { route } from "../../utils/route";

export default function Profile() {
  const [clinicianData, setClinicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const handleModal = () => {
    setIsOpen(!isOpen);
  };

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const handlePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };

  useEffect(() => {
    const fetchClinicianData = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const response = await fetch(
          `http://localhost:8000/${route.clinician.fetch}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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

        {/* EDIT MODAL */}
        {isOpen && (
          <EditProfile
            editProfileAPI={route.clinician.edit}
            editPictureAPI={route.clinician.picture}
            userDetails={clinicianData}
            closeModal={handleModal}
            isOwner={true}
          />
        )}

        {/* CHANGE PASS MODAL */}
        {isPasswordModalOpen && (
          <ChangePassword
            editPasswordAPI={route.clinician.password}
            closeModal={handlePasswordModal}
          />
        )}

        <Col xs={{ order: 12 }} lg={{ order: 1 }}>
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

          <Row lg md>
            {/* YOUR PROFILE */}
            <Col lg className="height-responsive full-height">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Your Profile</h4>
              </div>

              <div className="card-container d-flex flex-column gap-2 notif-home">
                {/* IMAGE COMPONENT */}
                <div className="p-3">
                  <div className="profile-img">
                    <img
                      src={clinicianData?.profilePicture}
                      alt="Profile"
                      className="img-fluid"
                    />
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="d-flex flex-column g-1 mb-2 mx-3">
                  <h3 className="fw-bold mb-0">
                    {clinicianData?.firstName} {""}
                    {clinicianData?.middleName} {""}
                    {clinicianData?.lastName}
                  </h3>
                  <p className="mb-0">{clinicianData?.address}</p>
                  <p className="mb-0">{clinicianData?.mobile}</p>
                  <p className="mb-0">{clinicianData?.email}</p>
                </div>
              </div>
            </Col>

            {/* ACTIONS */}
            <Col lg className="height-responsive">
              {/* HEADING */}
              <div className="d-flex justify-content-between my-3 py-3 px-3 card-content-bg-light text-header">
                <h4 className="fw-bold my-0 mx-0 card-text">Actions</h4>
              </div>

              <div className="card-container d-flex justify-content-center align-items-center flex-column gap-2 scrollable-div notif-home">
                {/* BUTTONS */}
                <button className="action-btn" onClick={handleModal}>
                  Edit Profile
                </button>
                <button
                  className="action-btn"
                  onClick={handlePasswordModal}
                >
                  Change Password
                </button>
                <Link to="/clinician/schedule">
                  <button className="action-btn">Manage Schedule</button>
                </Link>
                {/* TO DO: Create Modal for Request Content */}
                <button className="action-btn">Request Content</button>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
