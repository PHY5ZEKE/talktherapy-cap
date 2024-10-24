import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

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
    } else if (placeholder === "Confirm new password") {
      setConfirmPassword(value);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      notify("Password do not match.")
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
        failNotify(toastMessage.fail.edit);
      }
    } catch (error) {
      failNotify(toastMessage.fail.fetch);
      failNotify(toastMessage.fail.error);

      if (error.message === "Unexpected response format") {
        failNotify(toastMessage.fail.server)
      } else if (error.response) {
        // Server responded with a status other than 200 range
        failNotify(toastMessage.fail.server)
      } else if (error.request) {
        // Request was made but no response received
        failNotify(toastMessage.fail.server)
 
      } else {
        // Something else happened while setting up the request
        failNotify(toastMessage.fail.error)
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
                className="form-control rounded-3 me-3"
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
                className="form-control rounded-3 me-3"
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
                className="form-control rounded-3 me-3"
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

          <button type="submit" className="text-button w-100 mt-3">
            Save
          </button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="text-button fw-bold" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
