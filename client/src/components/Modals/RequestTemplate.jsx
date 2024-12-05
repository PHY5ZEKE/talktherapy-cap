import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { emailRegister } from "../../utils/emailRegister";

export default function RequestContent() {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const appURL = import.meta.env.VITE_APP_URL;

  const [request, setRequest] = useState("");

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
                <p className="fw-bold mb-0 text-center">
                  Please specify your requested content.
                </p>
                <textarea
                  type="text"
                  className="form-control"
                  placeholder="Enter email"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <div
              className="text-button border fw-bold"
              style={{ cursor: "pointer" }}
            >
              Submit
            </div>
            <div
              className="text-button-red border fw-bold"
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
