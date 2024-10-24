import { useState } from "react";
import "./modal.css";
import { route } from "../../utils/route";

export default function RequestAccess({ openModal}) {
  const appURL = import.meta.env.VITE_APP_URL;

  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Request Access</h3>
            <p className="">
              You are requesting for access to this patient's records.
            </p>
          </div>

          <div className="d-flex justify-content-center">
            <form className="container w-100">
              <p className="fw-bold text-center mb-1">State Reason</p>
              <textarea
                className="form-control"
                aria-label="With textarea"
                placeholder="Enter your reason for requesting access to this patient's records"
              ></textarea>
              <div className="d-flex justify-content-center mt-3 gap-3">
                <button type="submit" className="text-button border">
                  <p className="fw-bold my-0 status">SUBMIT</p>
                </button>
                <button className="text-button border" onClick={handleClose}>
                  <p className="fw-bold my-0 status">CANCEL</p>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
