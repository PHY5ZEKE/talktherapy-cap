import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";
import { emailRequestContent } from "../../utils/emailRequestContent";

export default function RequestContent({ handleModal, clinicianData }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

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
    handleModal();
  };

  const handleSubmit = () => {
    if (!request) {
      failNotify("Request content is required.");
      return;
    }

    emailRequestContent(clinicianData, request, accessToken)
      .then((response) => {
        notify("Request sent successfully!");
      })
      .catch((error) => {
        console.log(error);
        failNotify("Failed to send request. Try again.");
      });
    handleModal();
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h5 className="fw-bold">Request Content</h5>
            <p className="mb-0">Please verify your inputs before proceeding.</p>
            <p className="mb-3">
              This will be sent to admins and notify them with your request.
            </p>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <p className="fw-bold mb-0 text-center">
                  Specify your requested content.{" "}
                  <span className="text-required">*</span>
                </p>
                <textarea
                  type="text"
                  className="form-control"
                  placeholder="Enter desired content here..."
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
              onClick={handleSubmit}
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
