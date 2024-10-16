import "./modal.css";
export default function ConfirmReschedule({
  onClick,
  closeModal,
  openResched,
}) {
  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  const handleResched = (e) => {
    e.preventDefault();
    onClick();
    closeModal();
    openResched();
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">
              Are you sure you want to change schedule?
            </h3>
            <p className="mb-0">
              The requested schedule will be subject for approval
            </p>
            <p>Please verify your transaction before proceeding.</p>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">Date</p>
                <p>July 4, 2024</p>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Time</p>
                <p>2:00 PM - 3:00 PM</p>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Session</p>
                <p>Nicole Oraya</p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <form className="container">
              <p className="text-center">
                What is your reason for rescheduling the current session?
              </p>
              <textarea
                className="form-control"
                aria-label="With textarea"
              ></textarea>
            </form>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button onClick={handleResched} className="button-group bg-white">
              <p className="fw-bold my-0 status">RESCHEDULE</p>
            </button>
            <button onClick={handleClick} className="button-group bg-white">
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
