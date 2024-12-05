import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { validatePassword } from "../../../../shared/password"; // Adjust the import path

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

export default function ChangePassword({ editPasswordAPI, closeModal }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [showPasswordModal, setShowPasswordModal] = useState(true);

  const appURL = import.meta.env.VITE_APP_URL;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [passwordValidationMessages, setPasswordValidationMessages] = useState({
    length: "Must be at least 8 characters",
    lowercase: "Must have one lowercase letter",
    uppercase: "Must have one uppercase letter",
    number: "Must include a number",
    special: "Must include a special character",
  });

  const [isTypingPassword, setIsTypingPassword] = useState(false);

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

  // Close Modal
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    closeModal();
  };

  const handlePasswordChange = (e) => {
    const { placeholder, value } = e.target;
    if (placeholder === "Enter current password") {
      setCurrentPassword(value);
    } else if (placeholder === "Enter new password") {
      setNewPassword(value);
      setIsTypingPassword(true);
      const validationMessages = {
        length: value.length >= 8 ? "" : "Must be at least 8 characters",
        lowercase: /[a-z]/.test(value) ? "" : "Must have one lowercase letter",
        uppercase: /[A-Z]/.test(value) ? "" : "Must have one uppercase letter",
        number: /\d/.test(value) ? "" : "Must include a number",
        special: /[^a-zA-Z0-9]/.test(value)
          ? ""
          : "Must include a special character",
      };
      setPasswordValidationMessages(validationMessages);
    } else if (placeholder === "Confirm new password") {
      setConfirmPassword(value);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      failNotify("New password and confirm password do not match.");
      return;
    }

    // Validate new password format
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      failNotify(passwordValidationError);
      return;
    }

    try {
      const response = await fetch(`${appURL}/${editPasswordAPI}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Unexpected response format");
      }

      if (response.ok) {
        notify(toastMessage.success.edit);
        handleCloseModal();
      } else {
        if (data.message === "Current password is incorrect") {
          failNotify("Current password is incorrect.");
        } else {
          failNotify("Current password is incorrect.");
        }
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);

      if (error.message === "Unexpected response format") {
        failNotify(toastMessage.fail.server);
      } else if (error.response) {
        // Server responded with a status other than 200 range
        failNotify(toastMessage.fail.server);
      } else if (error.request) {
        // Request was made but no response received
        failNotify(toastMessage.fail.server);
      } else {
        // Something else happened while setting up the request
        failNotify(toastMessage.fail.error);
      }
    }
  };

  return (
    <Modal
      show={showPasswordModal}
      onHide={handleCloseModal}
      className="p-3"
      centered
    >
      <Modal.Header>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleChangePasswordSubmit}>
          <div className="form-group">
            <p className="mb-0">
              Current Password <span className="text-required">*</span>
            </p>
            <div className="input-group">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className="form-control rounded-3 me-3"
                placeholder="Enter current password"
                value={currentPassword}
                name="currentPassword"
                onChange={handlePasswordChange}
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="text-button fw-bold border"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <p className="mb-0">
              New Password <span className="text-required">*</span>
            </p>
            <div className="input-group">
              <input
                type={showNewPassword ? "text" : "password"}
                className="form-control rounded-3 me-3"
                placeholder="Enter new password"
                value={newPassword}
                name="newPassword"
                onChange={handlePasswordChange}
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="text-button fw-bold border"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="mt-2">
              {isTypingPassword &&
                Object.values(passwordValidationMessages).map(
                  (message, index) =>
                    message && (
                      <p key={index} className="text-danger mb-0">
                        {message}
                      </p>
                    )
                )}
            </div>
          </div>

          <div className="form-group">
            <p className="mb-0">
              Confirm New Password <span className="text-required">*</span>
            </p>
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control rounded-3 me-3"
                placeholder="Confirm new password"
                value={confirmPassword}
                name="confirmPassword"
                onChange={handlePasswordChange}
              />
              <div className="input-group-append">
                <button
                  type="button"
                  className="text-button fw-bold border"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="text-button fw-bold w-100 mt-3">
            Save
          </button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="text-button-red fw-bold" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
