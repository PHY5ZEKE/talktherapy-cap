import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { emailRegister } from "../../utils/emailRegister";

export default function RegisterClinician({ openModal, admin, onWebSocket }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const appURL = import.meta.env.VITE_APP_URL;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

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

  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${appURL}/${route.clinician.addClinician}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Add the Bearer token here
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(true);
        setMessage(data.message);
      } else {
        const userUpdate = {
          notif: "registerClinician",
          body: `${admin.firstName} ${admin.lastName} registered a new clinician email ${email}.`,
          show_to: "superadmin",
        };
        onWebSocket(userUpdate);
        notify(toastMessage.success.register);
        setError(false);
        setMessage(data.message);

        emailRegister(email)

        setEmail(""); // Clear the input field on success
      }
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setError(true);
      setMessage("An error occurred. Please try again.", error);
    }
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h5 className="fw-bold">Register Clinician</h5>
            <p className="mb-0">Please verify your inputs before proceeding.</p>
            <p>Enter the email of authorized clinicians only!</p>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <p className="fw-bold mb-0 text-center">Valid Email Address</p>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {message && (
                  <p
                    className={`text-${
                      error ? "danger" : "success"
                    } p-2 rounded-2 my-2`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <div
              className="text-button border fw-bold"
              style={{ cursor: "pointer" }}
              onClick={handleSubmit}
            >
              Submit
            </div>
            <div
              className="text-button border fw-bold"
              style={{ cursor: "pointer" }}
              onClick={handleClose}
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
