import { useContext, useState } from "react";
import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";

export default function UnarchiveUser({ handleModal, userDetails, onFetch }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      // PUT Method
      setIsSubmitting(true);
      const response = await fetch(`${appURL}/${route.sudo.unarchiveUser}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        onFetch();
        notify("Account is now archived and disabled.");
        handleModal();
      } else {
        failNotify("Failed to archive and disable account.");
        console.error("Error sending notification:", data.message);
      }
    } catch (err) {
      console.error(err);
      failNotify("Failed to archive and disable account.");
      setIsSubmitting(false);
    }
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
            <h3 className="fw-bold">Unarchive User</h3>
            <p className="mb-0">
              Please verify you action before proceeding. This will restore the
              user account and be able to re-login.
            </p>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <p className="fw-bold mt-3 text-center">{userDetails.email}</p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <div className="d-flex justify-content-center mt-3 gap-3">
              <button
                type="submit"
                className="text-button border"
                onClick={handleConfirm}
              >
                <p className="fw-bold my-0 status">
                  {isSubmitting ? (
                    <>
                      <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                      </div>
                    </>
                  ) : (
                    "Confirm"
                  )}
                </p>
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
