import { useState } from "react";
import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";
import { toastMessage } from "../../utils/toastHandler";
import { emailRegister } from "../../utils/emailRegister";

export default function RegisterAdmin({ openModal, onFetch }) {
  const appURL = import.meta.env.VITE_APP_URL;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
      const response = await fetch(`${appURL}/${route.admin.addAdmin}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setIsSubmitting(false);
      if (data.error) {
        setError(true);
        setMessage(data.message);
      } else {
        onFetch();
        notify(toastMessage.success.register);
        setError(false);
        setMessage(data.message);

        emailRegister(email);

        setEmail(""); // Clear the input field on success
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(true);
      failNotify(toastMessage.fail.error);
    }
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h5 className="fw-bold">Register Admin</h5>
            <p className="mb-0">Please verify your inputs before proceeding.</p>
            <p>Enter the email of authorized administrators only!</p>
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <p className="fw-bold mb-0 text-center">
                  Valid Email Address <span className="text-required">*</span>
                </p>
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
              className="text-button fw-bold border"
              style={{ cursor: "pointer" }}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </>
              ) : (
                "Submit"
              )}
            </div>
            <div
              className="text-button-red fw-bold border"
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
