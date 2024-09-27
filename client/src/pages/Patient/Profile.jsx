import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, { useState, useEffect } from "react";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";

export default function Profile() {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  const handleShowModal = () => {
    setFirstName(patientData.firstName);
    setMiddleName(patientData.middleName);
    setLastName(patientData.lastName);
    setMobile(patientData.mobile);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowPasswordModal = () => setShowPasswordModal(true); // Show change password modal
  const handleClosePasswordModal = () => setShowPasswordModal(false);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        "http://localhost:8000/patient-SLP/edit-patient",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName,
            middleName,
            lastName,
            mobile,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Profile updated successfully.");
        setPatientData(data.patienslp);
        handleCloseModal();
        window.location.reload();
      } else {
        alert(data.message || "Error updating profile.");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Error updating profile.");
    }
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleProfilePictureUpload = async () => {
    const token = localStorage.getItem("accessToken");

    if (!profilePicture) {
      alert("Please select a profile picture to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch(
        "http://localhost:8000/patient-SLP/update-profile-picture",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Profile picture updated successfully.");
        setPatientData((prevData) => ({
          ...prevData,
          profilePicture: data.profilePicture,
        }));
      } else {
        alert(data.message || "Error updating profile picture.");
      }
    } catch (error) {
      console.error("Error updating profile picture", error);
      alert("Error updating profile picture.");
    }
  };

  const handlePasswordChange = (e) => {
    const { placeholder, value } = e.target;
    if (placeholder === "Enter current password") {
      setCurrentPassword(value);
    } else if (placeholder === "Enter new password") {
      setNewPassword(value);
    } else if (placeholder === "Confirm new password") {
      setConfirmPassword(value);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/patient-SLP/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Unexpected response format");
      }

      if (response.ok) {
        alert("Password changed successfully.");
        handleClosePasswordModal();
      } else {
        alert(data.message || "Error changing password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.message === "Unexpected response format") {
        alert("Server returned an unexpected response format.");
      } else if (error.response) {
        // Server responded with a status other than 200 range
        alert(
          `Server Error: ${error.response.status} - ${error.response.data.message}`
        );
      } else if (error.request) {
        // Request was made but no response received
        alert("Network Error: No response received from server.");
      } else {
        // Something else happened while setting up the request
        alert(`Error: ${error.message}`);
      }
    }
  };

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
    <Container>
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
                <h4 className="fw-bold my-0 mx-0 card-text">Your Profile</h4>
              </div>

              <div className="card-container d-flex flex-column gap-2 notif-home">
                {/* IMAGE COMPONENT */}
                <div className="p-3">
                  <div className="profile-img">
                    <img src={patientData?.profilePicture} alt="Profile" />
                  </div>
                </div>

                {/* NOTIFICATION COMPONENT */}
                <div className="d-flex flex-column g-1 mb-2 mx-3">
                  <h3 className="fw-bold mb-0">
                    {patientData?.firstName} {patientData?.middleName}{" "}
                    {patientData?.lastName}
                  </h3>
                  <p className="mb-0">{patientData?.diagnosis}</p>
                  <p className="mb-0">{patientData?.birthday}</p>
                  <p className="mb-0">{patientData?.mobile}</p>
                  <p className="mb-0">{patientData?.email}</p>
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
                <button className="action-btn" onClick={handleShowModal}>
                  Edit Profile
                </button>
                <button
                  className="action-btn"
                  onClick={handleShowPasswordModal}
                >
                  Change Password
                </button>
              </div>
            </Col>

            <Col lg className="height-responsive"></Col>
          </Row>
        </Col>
      </Row>

      {/* MODAL */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditProfileSubmit}>
            <h3 className="mt-4">Profile Picture</h3>
            <div className="form-group mb-3">
              <p className="mb-0">Upload Profile Picture</p>
              <input
                type="file"
                className="form-control"
                onChange={handleProfilePictureChange}
              />
              <button
                type="button"
                className="action-btn btn-text-blue btn-primary mt-2"
                onClick={handleProfilePictureUpload}
              >
                Upload Picture
              </button>
            </div>

            <h3>Basic Information</h3>
            <div className="form-group">
              <p className="mb-0">First Name</p>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <p className="mb-0">Middle Name</p>
              <input
                type="text"
                className="form-control"
                name="middleName"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <p className="mb-0">Last Name</p>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <p className="mb-0">Clinic Address</p>
              <input
                type="text"
                className="form-control"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="action-btn btn-text-blue btn-primary"
            >
              Save
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showPasswordModal}
        onHide={handleClosePasswordModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleChangePasswordSubmit}>
            <div className="form-group">
              <p className="mb-0">Current Password</p>
              <div className="input-group">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  name="currentPassword"
                  onChange={handlePasswordChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <p className="mb-0">New Password</p>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter new password"
                  value={newPassword}
                  name="newPassword"
                  onChange={handlePasswordChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <p className="mb-0">Confirm New Password</p>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  name="confirmPassword"
                  onChange={handlePasswordChange}
                />
                <div className="input-group-append">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="action-btn btn-text-blue btn-primary mt-3"
            >
              Save
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePasswordModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
