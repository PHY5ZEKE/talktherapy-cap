import { useState, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";

export default function Soap({
  openModal,
  clinicianId,
  clinicianName,
  patientName,
  patientId,
  onWebSocket,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [date, setDate] = useState("");
  const [activityPlan, setActivityPlan] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [recommendation, setRecommendation] = useState("");

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
    openModal();
  };

  // Handle form submit
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDisabled(true);
    setIsSubmitting(true);

    if (!date) {
      failNotify("Session Date is required");
      return;
    }
    if (!activityPlan) {
      failNotify("Session Plan is required");
      return;
    }
    if (!sessionType) {
      failNotify("Session Type is required");
      return;
    }
    if (!subjective) {
      failNotify("Subjective is required");
      return;
    }
    if (!objective) {
      failNotify("Objective/Goals are required");
      return;
    }
    if (!assessment) {
      failNotify("Assessment/Performance is required");
      return;
    }
    if (!recommendation) {
      failNotify("Plan/Recommendations are required");
      return;
    }

    const soapData = {
      patientId,
      clinicianId,
      date,
      activityPlan,
      sessionType,
      subjective,
      objective,
      assessment,
      recommendation,
    };

    try {
      const response = await fetch(`${appURL}/${route.soap.create}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(soapData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response:", errorData); // Log the server response
        throw new Error("Failed to create SOAP diagnosis");
      }

      const data = await response.json();

      const userUpdate = {
        notif: "addSOAP",
        body: `Clinician ${clinicianName} has added a SOAP/Diagnosis. Kindly check your feedbacks.`,
        diagnosis: recommendation,
        show_to: [patientId],
      };

      notify("SOAP diagnosis created successfully");
      onWebSocket(userUpdate);

      openModal(); // Close the modal after successful submission
    } catch (error) {
      failNotify("Failed to create SOAP diagnosis");
    } finally {
      setIsSubmitting(false);
      setIsDisabled(false);
    }
  };

  const modules = {
    toolbar: false,
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <h3 className="fw-bold text-center">Add SOAP</h3>
          <p className="mb-0 text-center">
            Please verify your inputs before proceeding.
          </p>

          <p className="my-3 text-center">
            <span className="fw-bold">Patient Name: </span>
            {patientName}
          </p>

          <div className="container text-center">
            <div className="row">
              <div className="w-100 mb-3">
                <p className="fw-bold mb-0">
                  Session Date <span className="text-required">*</span>
                </p>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="w-100 mb-3">
                <p className="fw-bold mb-0">
                  Session Plan <span className="text-required">*</span>
                </p>
                <input
                  type="text"
                  className="form-control"
                  value={activityPlan}
                  onChange={(e) => setActivityPlan(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">
                  Session Type <span className="text-required">*</span>
                </p>
                <input
                  type="text"
                  className="form-control"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            className="col bg-white overflow-auto"
            style={{ maxHeight: "350px" }}
          >
            <div className="container text-center">
              <div className="row">
                <div className="col mb-3">
                  <p className="fw-bold mb-0">
                    Subjective <span className="text-required">*</span>
                  </p>
                  <ReactQuill
                    value={subjective}
                    onChange={setSubjective}
                    modules={modules}
                    className="overflow-auto"
                  />
                </div>
              </div>
            </div>

            <div className="container text-center">
              <div className="row overflow-auto">
                <div className="col mb-3">
                  <p className="fw-bold mb-0">
                    Objective/Goals <span className="text-required">*</span>
                  </p>
                  <ReactQuill
                    value={objective}
                    onChange={setObjective}
                    modules={modules}
                  />
                </div>
              </div>
            </div>

            <div className="container text-center">
              <div className="row overflow-auto">
                <div className="col">
                  <p className="fw-bold mb-0">
                    Assessment/Performance{" "}
                    <span className="text-required">*</span>
                  </p>
                  <ReactQuill
                    value={assessment}
                    onChange={setAssessment}
                    modules={modules}
                    className="overflow-auto"
                  />
                </div>
              </div>
            </div>

            <div className="container text-center">
              <div className="row">
                <div className="col mb-3">
                  <p className="fw-bold mb-0">
                    Plan/Recommendations<span className="text-required">*</span>
                  </p>
                  <ReactQuill
                    value={recommendation}
                    onChange={setRecommendation}
                    modules={modules}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button
              type="submit"
              className="text-button border"
              onClick={handleSubmit}
              disabled={isDisabled || isSubmitting}
            >
              <p className="fw-bold my-0 status">
                {isSubmitting ? `Submitting` : `Submit`}
              </p>
            </button>
            <button className="text-button-red border" onClick={handleClose}>
              <p className="fw-bold my-0 status">Cancel</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
