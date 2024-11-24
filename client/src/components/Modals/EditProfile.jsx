import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { toast, Slide } from "react-toastify";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toastMessage } from "../../utils/toastHandler";

// FOR SUDO, ADMIN, AND PATIENT
export default function EditProfile({
  editProfileAPI,
  userDetails,
  closeModal,
  isOwner,
  whatRole,
  onWebSocket,
  onFetch,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const userRole = authState.userRole;

  const [userData, setUserData] = useState(userDetails);

  const appURL = import.meta.env.VITE_APP_URL;

  const [showModal, setShowModal] = useState(true);

  const [profilePicture, setProfilePicture] = useState(null);

  const notify = (message) =>
    toast.success(message, {
      transition: Slide,
      autoClose: 2000,
    });

  const failNotify = (message) =>
    toast.error(message, {
      transition: Slide,
      autoClose: 2000,
    });

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

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!firstName.trim()) {
      failNotify("First name is required.");
      return;
    }
    if (!middleName.trim()) {
      failNotify("Middle name is required.");
      return;
    }
    if (!lastName.trim()) {
      failNotify("Last name is required.");
      return;
    }
    if (!mobile.trim()) {
      failNotify("Mobile number is required.");
      return;
    }
    if (!address.trim()) {
      failNotify("Address is required.");
      return;
    }

    // Validate firstName, middleName, and lastName
    const nameRegex = /^[A-Za-z\s]{1,35}$/;
    if (!nameRegex.test(firstName)) {
      failNotify(
        "First name must be a string of letters and not exceed 35 characters."
      );
      return;
    }
    if (!nameRegex.test(middleName)) {
      failNotify(
        "Middle name must be a string of letters and not exceed 35 characters."
      );
      return;
    }
    if (!nameRegex.test(lastName)) {
      failNotify(
        "Last name must be a string of letters and not exceed 35 characters."
      );
      return;
    }

    // Validate mobile number (Philippine 11-digit format)
    const mobileRegex = /^09\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      failNotify("Mobile number must be a valid Philippine 11-digit format.");
      return;
    }

    // Validate address (must not exceed 250 characters)
    if (address.length > 250) {
      failNotify("Address must not exceed 250 characters.");
      return;
    }

    try {
      const response = await fetch(`${appURL}/${editProfileAPI}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
        notify(toastMessage.success.edit);
        handleCloseModal();
        if (!isOwner) {
          const userUpdate = {
            notif: "higherAccountEdit",
            user: `${firstName} ${middleName} ${lastName}`,
            id: userData._id,
          };
          onWebSocket(userUpdate);
        }
        onFetch();
        closeModal();
      } else {
        failNotify(toastMessage.fail.edit);
      }
    } catch (error) {
      failNotify(toastMessage.fail.error);
      console.log(error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal} centered>
      <Modal.Header>
        <Modal.Title>Edit Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleEditProfileSubmit}>
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

          {whatRole !== "patientslp" && (
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

          <button type="submit" className="text-button border mt-3 w-100">
            Save
          </button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button className="text-button fw-bold" onClick={handleCloseModal}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
