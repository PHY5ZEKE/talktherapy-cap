import { useState, useEffect } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

// FOR SUDO, ADMIN, AND PATIENT
export default function EditProfile({
  editProfileAPI,
  editPictureAPI,
  userDetails,
  closeModal,
  isOwner,
  whatRole,
}) {
  const [userData, setUserData] = useState(userDetails);
  const [updatedUser, setUpdatedUser] = useState(null);

  const [showModal, setShowModal] = useState(true);

  const [profilePicture, setProfilePicture] = useState(null);

  // Form Inputs
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setMiddleName(userData.middleName || "");
      setLastName(userData.lastName || "");
      setAddress(userData.address || "");
      setMobile(userData.mobile || "");
    }
  }, [userData, userDetails]);

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    closeModal();
  };

  // Edit Profile Submit Listener
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`http://localhost:8000/${editProfileAPI}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          address,
          mobile,
          id: userData._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile updated successfully.");
        setUpdatedUser(data.userDetails);
        handleCloseModal();
      } else {
        alert(data.message || "Error updating profile.");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Error updating profile.");
    }
  };

  // Change Profile Picture Listener
  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  // Upload Profile Picture Listener
  const handleProfilePictureUpload = async () => {
    const token = localStorage.getItem("accessToken");

    if (!profilePicture) {
      alert("Please select a profile picture to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch(`http://localhost:8000/${editPictureAPI}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile picture updated successfully.");
        setUpdatedUser((prevData) => ({
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

  return (
    <Modal show={showModal} onHide={handleCloseModal} centered>
      <Modal.Header>
        <Modal.Title>Edit Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleEditProfileSubmit}>
          {isOwner && (
            <>
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
            </>
          )}

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

          {isOwner && (
            <>
              <div className="form-group">
                <p className="mb-0">Contact Number</p>
                <input
                  type="text"
                  className="form-control"
                  name="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
            </>
          )}

          {whatRole !== "patient" && (
            <div className="form-group">
              <p className="mb-0">Clinic Address</p>
              <input
                type="text"
                className="form-control"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}

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
  );
}
