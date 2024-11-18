import "./modal.css";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

// Utils
import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

export default function JoinAppointment({
  selectedClinician,
  selectedSchedule,
  patientId,
  closeModal,
  onWebSocket,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [medicalDiagnosis, setMedicalDiagnosis] = useState("");
  const [sourceOfReferral, setSourceOfReferral] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [referralUpload, setReferralUpload] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

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
    closeModal();
  };

  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    setIsSubmitting(true);

    if (!medicalDiagnosis || !sourceOfReferral || !chiefComplaint) {
      failNotify("All fields are required.");
      setIsSubmitting(false);
      setIsDisabled(false);
      return;
    }

    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("sourceOfReferral", sourceOfReferral);
    formData.append("chiefComplaint", chiefComplaint);
    formData.append("selectedClinician", selectedClinician);
    formData.append("selectedSchedule", selectedSchedule);
    formData.append("file", referralUpload);

    const formJson = {
      patientId: patientId,
      sourceOfReferral: sourceOfReferral,
      chiefComplaint: chiefComplaint,
      selectedClinician: selectedClinician,
      selectedSchedule: selectedSchedule,
    };

    try {
      // Send JSON to Server
      const response = await fetch(
        `${appURL}/${route.appointment.createJSON}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
          body: JSON.stringify(formJson),
        }
      );

      const data = await response.json();

      formData.append("appointmentId", data.appointmentId);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create appointment");
      }

      // Send File to Server
      const fileResponse = await fetch(
        `${appURL}/${route.appointment.createFile}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
          body: formData,
        }
      );

      const fileData = await fileResponse.json();
      if (!fileResponse.ok) {
        throw new Error(fileData.message || "Failed to create appointment");
      }

      const userUpdate = {
        notif: "appointmentJoin",
      };
      onWebSocket(userUpdate);

      notify(toastMessage.success.book);
      // window.location.reload(); // Reload the page on success
      closeModal();
    } catch (error) {
      console.error(error);
      failNotify(toastMessage.fail.error);
    } finally {
      setIsSubmitting(false);
      setIsDisabled(false);
    }
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
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Medical Diagnosis</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex. Aphasia"
                    value={medicalDiagnosis}
                    onChange={(e) => setMedicalDiagnosis(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Referral</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Source of referral"
                    value={sourceOfReferral}
                    onChange={(e) => setSourceOfReferral(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Reason for Consultation
                  </Form.Label>
                  <FloatingLabel
                    controlId="floatingTextarea"
                    label="Reason for Consultation"
                    className="mb-3"
                  >
                    <Form.Control
                      as="textarea"
                      placeholder="Reason for Consultation"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                    />
                  </FloatingLabel>
                </Form.Group>

                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label className="fw-bold">Referral Upload</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setReferralUpload(e.target.files[0])}
                  />
                </Form.Group>

                <div className="d-flex justify-content-center mt-3 gap-3">
                <button type="submit" className="text-button border" disabled={isDisabled || isSubmitting}>
                {isSubmitting ? <p className="fw-bold my-0 status">Submitting...</p> : <p className="fw-bold my-0 status">BOOK</p>}
                </button>
                  <button onClick={handleClose} className="text-button border">
                    <p className="fw-bold my-0 status">CANCEL</p>
                  </button>
                </div>
              </Form>
            </div>
          </div>

          <div className="row text-center" hidden>
            <div className="col">
              <p className="fw-bold">Selected Clinician</p>
              <p>{selectedClinician}</p>
            </div>
            <div className="col">
              <p className="fw-bold">Selected Schedule</p>
              <p>{selectedSchedule}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
