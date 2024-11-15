import "./modal.css";

export default function ConfirmVideoCall({
  close,
  confirm,
}) {


  const handleConfirm = (e) => {
    e.preventDefault();
    confirm();
  };

  const handleClose = (e) => {
    e.preventDefault();
    close();
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Ready to join the call?</h3>
            <p>Before joining the call please make sure to be in a well-lit environment. Make sure that your microphone is audible and clear.</p>
            <p className="mb-0">To start sharing your video and join press <span className="fw-bold">confirm</span>. To go back, press <span className="fw-bold">cancel</span>.</p>
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
