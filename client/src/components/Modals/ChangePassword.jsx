import { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function ChangePassword({ editPasswordAPI, closeModal }) {
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  const appURL = import.meta.env.VITE_APP_URL;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

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
      const response = await fetch(`${appURL}/${editPasswordAPI}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        alert("Password changed successfully.");
        handleCloseModal();
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
  return (
    <Modal show={showPasswordModal} onHide={handleCloseModal} centered>
      <Modal.Header>
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
                  className="text-button border"
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
                  className="text-button border"
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
                  className="text-button border"
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
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
