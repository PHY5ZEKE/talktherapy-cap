import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

export default function ConfirmationDialog({
  header,
  body,
  handleModal,
  confirm,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const appURL = import.meta.env.VITE_APP_URL;

  const handleConfirm = (e) => {
    e.preventDefault();
    confirm();
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
            <h3 className="fw-bold">{header}</h3>
            <p className="mb-0">{body}</p>
          </div>

          <div className="d-flex justify-content-center">
            <div className="d-flex justify-content-center mt-3 gap-3">
              <button
                type="submit"
                className="text-button border"
                onClick={handleConfirm}
              >
                <p className="fw-bold my-0 status">CONFIRM</p>
              </button>
              <button className="text-button border" onClick={handleClose}>
                <p className="fw-bold my-0 status">CANCEL</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
