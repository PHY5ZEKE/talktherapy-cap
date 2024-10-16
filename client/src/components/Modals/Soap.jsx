import "./modal.css";

import Calendar from "../../assets/icons/Calendar";

export default function Soap({ openModal }) {
  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Add SOAP to Patient</h3>
            <p className="mb-0">Please verify your inputs before proceeding.</p>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">Date</p>
                <Calendar />
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Attending Clinician</p>
                <p>Dr. Dela Cruz Reyes</p>
              </div>
            </div>
          </div>

          <div className="container d-flex justify-content-center">
            <form className="container">
              <p className="text-center">Diagnosis</p>
              <textarea
                className="form-control"
                aria-label="With textarea"
              ></textarea>
            </form>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button className="text-button border">
              <p className="fw-bold my-0 status">SUBMIT</p>
            </button>
            <button className="text-button border" onClick={handleClose}>
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
