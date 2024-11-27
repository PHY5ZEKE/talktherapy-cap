import { useState, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";

export default function SoapSidebar({
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
      failNotify("Activity Plan is required");
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
      failNotify("Assessment is required");
      return;
    }
    if (!recommendation) {
      failNotify("Recommendation is required");
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
        failNotify(errorData.message);
        throw new Error("Failed to create SOAP diagnosis. Already existing");
      }

      const data = await response.json();

      const userUpdate = {
        notif: "addSOAP",
        body: `Clinician ${clinicianName} has added a SOAP/Diagnosis. Kindly check your feedbacks.`,
        diagnosis: recommendation,
        show_to: [patientId],
      };

      console.log(data);
      notify("SOAP diagnosis created successfully");
      onWebSocket(userUpdate);

      openModal(); // Close the modal after successful submission
    } catch (error) {
      failNotify("Failed to create SOAP diagnosis.");
    }  finally {
      setIsSubmitting(false);
      setIsDisabled(false);
    }
  };

  const modules = {
    toolbar: false,
  };

  return (
    <>
      <div
        className="offcanvas offcanvas-start"
        data-bs-scroll="true"
        tabIndex="-1"
        id="soapSidebar"
        aria-labelledby="offcanvasWithBothOptionsLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasWithBothOptionsLabel">
            Add Soap
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <p className="text-center mb-0">Please verify your inputs before proceeding.</p>

        <div className="container text-center">
          <div className="row">
            <p className="my-3">
              <span className="fw-bold">Patient Name: </span>
              {patientName}
            </p>
          </div>
        </div>

        <div className="container text-center">
          <div className="row">
            <div className="w-100 mb-3">
              <p className="fw-bold mb-0">Session Date</p>
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
              <p className="fw-bold mb-0">Session Plan</p>
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
              <p className="fw-bold mb-0">Session Type</p>
              <input
                type="text"
                className="form-control"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col bg-white overflow-auto">
          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">Subjective</p>
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
                <p className="fw-bold mb-0">Objective/Goals</p>
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
                <p className="fw-bold mb-0">Assessment/Performance</p>
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
                <p className="fw-bold mb-0">Plan/Recommendations</p>
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
            {isSubmitting ? `SUBMITTING..` : `SUBMIT`}
            </p>
          </button>
        </div>
      </div>
    </>
  );
}
