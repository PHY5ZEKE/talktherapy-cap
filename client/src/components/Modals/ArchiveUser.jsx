import { useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";

export default function ArchiveUser({ handleModal, userDetails, onFetch }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const appURL = import.meta.env.VITE_APP_URL;

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

  const handleConfirm = async (e) => {
    e.preventDefault();

    const payload = {
      id: userDetails._id,
    };

    // PUT Method
    const response = await fetch(`${appURL}/${route.sudo.archiveUser}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      onFetch();
      notify("Account is now archived and disabled.");
      handleModal();
    } else {
      failNotify("Failed to archive and disable account.");
      console.error("Error sending notification:", data.message);
    }
    onFetch();
    handleModal();
  };

  const handleClose = (e) => {
    e.preventDefault();
    handleModal();
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">User Archival</h3>
            <p className="mb-0">
              Please verify you action before proceeding. This will tag the
              account as archived and disabled.
            </p>
          </div>

          <div className="d-flex justify-content-center">
            <div className="d-flex justify-content-center mt-3 gap-3">
              <button
                type="submit"
                className="text-button border"
                onClick={handleConfirm}
              >
                <p className="fw-bold my-0 status">Confirm</p>
              </button>
              <button className="text-button-red border" onClick={handleClose}>
                <p className="fw-bold my-0 status">Cancel</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
