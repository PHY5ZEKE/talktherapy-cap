import { useState } from "react";
import { route } from "../../utils/route";

export default function RegisterAdmin({ openModal }) {
  const appURL = import.meta.env.VITE_APP_URL;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${appURL}/${route.admin.addAdmin}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.error) {
        setError(true);
        setMessage(data.message);
      } else {
        setError(false);
        setMessage(data.message);
        setEmail(""); // Clear the input field on success
      }
    } catch (err) {
      setError(true);
      setMessage("An error occurred. Please try again.");
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
              className="text-button border"
              style={{ cursor: "pointer" }}
              onClick={handleSubmit}
            >
              Submit
            </div>
            <div
              className="text-button border"
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
