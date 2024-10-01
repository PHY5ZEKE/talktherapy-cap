import "./modal.css";

import { Link } from "react-router-dom";
export default function AppointmentDetails({ openModal }) {
  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };
  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Appointment Details</h3>
            <p className="mb-0">Verify if the following details are correct.</p>
          </div>

          {/* Source of Referral, Chief Complaint, Selected Clinician, Specialization, Schedule, Referral Upload, Status */}
          <div className="container text-center">
            {/* INFORMATION */}
            <div className="row text-center">
              <p className="fw-bold mt-3 mb-0">Date</p>
              <p>July 4, 2024 2:00 PM - 3:00 PM</p>
            </div>

            <div className="row text-center">
              <div className="col">
                <p className="fw-bold mb-0">Clinician</p>
                <div>
                  <p className="">Rico Nieto</p>
                  {/* <p>Specialization</p> */}
                </div>

                <div>
                  <p className="fw-bold mb-0">Status</p>
                  <p>Approved</p>
                </div>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Chief Complaint</p>
                <p>Headache</p>
                <p className="fw-bold mb-0">Source of Referral</p>
                <p>Self</p>
              </div>
            </div>

            <div className="col">
              <p className="fw-bold mb-0">Referral Upload</p>
              <p>None</p>
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
