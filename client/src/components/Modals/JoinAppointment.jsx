import "./modal.css";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";

export default function JoinAppointment({ openModal }) {
  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };
  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-content-center">
        <div className="d-flex flex-column text-center">
          <h3 className="fw-bold">Join Appointment</h3>
          <p className="mb-0">Please fill up the form accordingly.</p>
        </div>

        <div className="container">
          {/* Join Appointment Form */}
          <div className="row">
            <div className="col">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Medical Diagnosis</Form.Label>
                  <Form.Control type="text" placeholder="Ex. Aphasia" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Referral</Form.Label>
                  <Form.Control type="text" placeholder="Source of referral" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Chief Complaint</Form.Label>
                  <FloatingLabel
                    controlId="floatingTextarea"
                    label="Chief Complaint"
                    className="mb-3"
                  >
                    <Form.Control as="textarea" placeholder="Chief complaint" />
                  </FloatingLabel>
                </Form.Group>

                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label className="fw-bold">Default file input example</Form.Label>
                  <Form.Control type="file" />
                </Form.Group>
              </Form>
            </div>
          </div>

          <div className="row text-center">
            <div className="col">
              <p className="fw-bold">Selected Clinician</p>
              <p>Dr. Juan Dela Cruz</p>
            </div>
            <div className="col">
              <p className="fw-bold">Selected Schedule</p>
              <p>September 2, 2024 4:00 PM - 5:00 PM</p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3 gap-3">
          <button className="button-group bg-white">
            <p className="fw-bold my-0 status">BOOK</p>
          </button>
          <button onClick={handleClose} className="button-group bg-white">
            <p className="fw-bold my-0 status">CANCEL</p>
          </button>
        </div>
      </div>
    </div>
  );
}
