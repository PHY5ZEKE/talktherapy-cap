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
  selectedSpecialization,
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
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsDisabled(true);
    setIsSubmitting(true);

    console.log(patientId);
    console.log(selectedClinician);
    console.log(`Selected Schedule ID = ${selectedSchedule}`);

    if (
      !medicalDiagnosis ||
      !sourceOfReferral ||
      !chiefComplaint ||
      !referralUpload
    ) {
      failNotify("All fields are required.");
      setIsSubmitting(false);
      setIsDisabled(false);
      return;
    }

    // Check if the medicalDiagnosis matches the specialization in the selected schedule
    if (medicalDiagnosis !== selectedSpecialization) {
      failNotify(
        "The selected medical diagnosis does not match the schedule's specialization."
      );
      setIsSubmitting(false);
      setIsDisabled(false);
      return;
    }

    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("medicalDiagnosis", medicalDiagnosis);
    formData.append("sourceOfReferral", sourceOfReferral);
    formData.append("chiefComplaint", chiefComplaint);
    formData.append("selectedClinician", selectedClinician._id);
    formData.append("selectedSchedule", selectedSchedule);
    formData.append("file", referralUpload);

    try {
      // Send JSON and File to Server
      const response = await fetch(
        `${appURL}/${route.appointment.createAppointment}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include the Bearer token in the headers
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create appointment");
      }

      const userUpdate = {
        notif: "appointmentJoin",
      };
      onWebSocket(userUpdate);

      notify(toastMessage.success.book);
      closeModal();
    } catch (error) {
      console.error(error);
      failNotify(error.message);
    } finally {
      setIsSubmitting(false);
      setIsDisabled(false);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-content-center">
        <div className="d-flex flex-column text-center">
          <h3 className="fw-bold">Book Appointment</h3>
          <p className="mb-0">Please fill up the form accordingly.</p>
        </div>

        <div className="container">
          {/* Join Appointment Form */}
          <div className="row">
            <div className="col">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Medical Diagnosis <span className="text-required">*</span>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={medicalDiagnosis}
                    onChange={(e) => setMedicalDiagnosis(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Medical Diagnosis
                    </option>
                    <option value="Autism Spectrum Disorder">
                      Autism Spectrum Disorder
                    </option>
                    <option value="Attention-Deficit Hyperactivity Disorder">
                      Attention-Deficit Hyperactivity Disorder
                    </option>
                    <option value="Global Developmental Delay">GDD</option>
                    <option value="Cerebral Palsy">Cerebral Palsy</option>
                    <option value="Down Syndrome">Down Syndrome</option>
                    <option value="Hearing Impairment">
                      Hearing Impairment
                    </option>
                    <option value="Cleft Lip and/or Palate">
                      Cleft Lip and/or Palate
                    </option>
                    <option value="Stroke">Stroke</option>
                    <option value="Stuttering">Stuttering</option>
                    <option value="Aphasia">Aphasia</option>
                    <option value="Others">Others</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Referral <span className="text-required">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Source of referral"
                    value={sourceOfReferral}
                    onChange={(e) => setSourceOfReferral(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Reason for Consultation{" "}
                    <span className="text-required">*</span>
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
                  <Form.Label className="fw-bold">
                    Referral Upload <span className="text-required">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setReferralUpload(e.target.files[0])}
                  />
                  <small className="form-text text-muted">
                    Accepted file formats: PDF, JPG, JPEG, PNG <br />
                  </small>

                  <small className="form-text text-muted">
                    File Size: 5 MB Limit
                  </small>
                </Form.Group>

                <div className="d-flex justify-content-center mt-3 gap-3">
                  <button
                    type="submit"
                    className="text-button border"
                    disabled={isDisabled || isSubmitting}
                  >
                    {isSubmitting ? (
                      <p className="fw-bold my-0 status">Submitting...</p>
                    ) : (
                      <p className="fw-bold my-0 status">BOOK</p>
                    )}
                  </button>
                  <button onClick={handleClose} className="text-button border">
                    <p className="fw-bold my-0 status">CANCEL</p>
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
