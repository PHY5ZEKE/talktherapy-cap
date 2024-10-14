import "./modal.css";

import { Link } from "react-router-dom";
export default function ChooseRegister({ openModal }) {
  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };
  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Register</h3>
            <p className="mb-0">Please register accordingly.</p>
          </div>

          <div className="container text-center">
            {/* SCHEDULE LIST RENDER */}
            <div className="row text-center">
              <div className="col">
                <Link to="/register/admin" className="registerLink">
                  Admin
                </Link>
              </div>

              <div className="col">
                <Link to="/register/clinician" className="registerLink">
                  Clinician
                </Link>
              </div>

              <div className="col">
                <Link to="/register/patientslp" className="registerLink">
                  Patient
                </Link>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button onClick={handleClose} className="button-group bg-white">
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
