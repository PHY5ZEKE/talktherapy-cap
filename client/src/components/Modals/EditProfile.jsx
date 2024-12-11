import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { toast, Slide } from "react-toastify";

import Modal from "react-bootstrap/Modal";
import { toastMessage } from "../../utils/toastHandler";

// FOR SUDO, ADMIN, AND PATIENT
export default function EditProfile({
  editProfileAPI,
  userDetails = {},
  closeModal,
  isOwner,
  whatRole,
  onWebSocket,
  onFetch,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const userRole = authState.userRole;

  const appURL = import.meta.env.VITE_APP_URL;

  const [showModal, setShowModal] = useState(true);

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
  const [form, setForm] = useState({
    firstName: userDetails?.firstName || "",
    middleName: userDetails?.middleName || "",
    lastName: userDetails?.lastName || "",
    address: userDetails?.address || "",
    mobile: userDetails?.mobile || "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    closeModal();
  };

  const [isSubmit, setIsSubmit] = useState(false);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!form.firstName.trim()) {
      failNotify("First name is required.");
      return;
    }
    if (!form.lastName.trim()) {
      failNotify("Last name is required.");
      return;
    }
    if (userRole !== "clinician" && !form.mobile.trim()) {
      failNotify("Mobile number is required.");
      return;
    }

    // Validate firstName, middleName, and lastName
    const nameRegex = /^[A-Za-z\s]{1,35}$/;
    if (!nameRegex.test(form.firstName)) {
      failNotify(
        "First name must be a string of letters and not exceed 35 characters."
      );
      return;
    }
    if (form.middleName && !nameRegex.test(form.middleName)) {
      failNotify(
        "Middle name must be a string of letters and not exceed 35 characters."
      );
      return;
    }
    if (!nameRegex.test(form.lastName)) {
      failNotify(
        "Last name must be a string of letters and not exceed 35 characters."
      );
      return;
    }

    // Validate mobile number (Philippine 11-digit format) if provided
    const mobileRegex = /^09\d{9}$/;
    if (form.mobile && !mobileRegex.test(form.mobile)) {
      failNotify("Mobile number must be a valid Philippine 11-digit format.");
      return;
    }

    // Validate address (must not exceed 250 characters)
    if (form.address.length > 250) {
      failNotify("Address must not exceed 250 characters.");
      return;
    }

    try {
      setIsSubmit(true);
      const response = await fetch(`${appURL}/${editProfileAPI}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          middleName: form.middleName,
          lastName: form.lastName,
          address: form.address,
          mobile: form.mobile,
          id: userDetails._id,
        }),
      });

      const data = await response.json();

      setIsSubmit(false);

      if (response.ok) {
        notify(toastMessage.success.edit);
        handleCloseModal();
        if (!isOwner) {
          const userUpdate = {
            notif: "higherAccountEdit",
            user: `${form.firstName} ${form.middleName} ${form.lastName}`,
            id: userDetails._id,
          };
          onWebSocket(userUpdate);
        }
        onFetch();
        closeModal();
      } else {
        failNotify(toastMessage.fail.edit);
      }
    } catch (error) {
      setIsSubmit(false);
      failNotify(toastMessage.fail.error);
      console.error("Error sending notification:", error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal} className="p-3" centered>
      <Modal.Header>
        <Modal.Title>Edit Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleEditProfileSubmit}>
          <h3>Basic Information</h3>
          <div className="form-group">
            <p className="mb-0">
              First Name <span className="text-required">*</span>
            </p>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <p className="mb-0">Middle Name</p>
            <input
              type="text"
              className="form-control"
              name="middleName"
              value={form.middleName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <p className="mb-0">
              Last Name <span className="text-required">*</span>
            </p>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          {isOwner && (
            <>
              <div className="form-group">
                <p className="mb-0">
                  Contact Number{" "}
                  {userRole !== "clinician" && (
                    <span className="text-required">*</span>
                  )}
                </p>
                <input
                  type="text"
                  className="form-control"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {whatRole !== "patientslp" && (
            <div className="form-group">
              <p className="mb-0">
                Clinic Address <span className="text-required">*</span>
              </p>
              <input
                type="text"
                className="form-control"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            className="text-button fw-bold border mt-3 w-100"
          >
            {isSubmit ? (
              <>
                <div class="mx-auto spinner-border text-primary" role="status">
                  <span class="sr-only mb-0">Loading...</span>
                </div>
              </>
            ) : (
              "Save"
            )}
          </button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button className="text-button-red fw-bold" onClick={handleCloseModal}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
