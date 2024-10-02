import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";

import EditProfile from "../../components/Modals/EditProfile";
import ChangePassword from "../../components/Modals/ChangePassword";

// Utils
import { route } from "../../utils/route";

export default function Profile() {
  const [adminData, setAdminData] = useState(null);
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

  // Fetch admin data from the backend
  const fetchAdminData = async () => {
    const token = localStorage.getItem("accessToken"); // Adjust this to where your token is stored (e.g., sessionStorage, cookies)

    try {
      const response = await fetch(
        `http://localhost:8000/${route.admin.fetch}`,
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
      setAdminData(data.admin);
      console.log(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="container-fluid m-0">
      <Row className="min-vh-100 vw-100">
        <Sidebar />

        {/* EDIT MODAL */}
        {isOpen && (
          <EditProfile
            editProfileAPI={route.admin.edit}
            editPictureAPI={route.admin.picture}
            userDetails={adminData}
            closeModal={handleModal}
            isOwner={true}
            onProfileUpdate={fetchAdminData} // Pass the callback function
          />
        )}

        {/* CHANGE PASS MODAL */}
        {isPasswordModalOpen && (
          <ChangePassword
            editPasswordAPI={route.admin.password}
            closeModal={handlePasswordModal}
          />
        )}

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
              <p className="m-0 fw-bold">{adminData?.firstName || "Admin"}</p>
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
                    <img src={adminData?.profilePicture} alt="Profile" />
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="d-flex flex-column g-1 mb-2 mx-3">
                  <h3 className="fw-bold mb-0">
                    {adminData?.firstName} {""}
                    {adminData?.middleName} {""}
                    {adminData?.lastName}
                  </h3>
                  <p className="mb-0">{adminData?.address}</p>
                  <p className="mb-0">{adminData?.mobile}</p>
                  <p className="mb-0">{adminData?.email}</p>
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
                <a href="/admin/archival">
                  <button className="action-btn">Data Archival</button>
                </a>
                <button className="action-btn" onClick={handleModal}>
                  Edit Profile
                </button>
                <button className="action-btn" onClick={handlePasswordModal}>
                  Change Password
                </button>
              </div>
            </Col>

            <Col lg></Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
