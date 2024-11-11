import { useState, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
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
  const [sessionRecording, setSessionRecording] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const soapData = {
      patientId,
      clinicianId,
      date,
      activityPlan,
      sessionType,
      sessionRecording,
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
        body: `Dr. ${clinicianName} has added a SOAP/Diagnosis. Kindly check your feedbacks.`,
        diagnosis: recommendation,
        show_to: [patientId],
      };

      notify("SOAP diagnosis created successfully");
      onWebSocket(userUpdate);

      openModal(); // Close the modal after successful submission
    } catch (error) {
      failNotify("Failed to create SOAP diagnosis");
    }
  };

  const modules = {
    toolbar: [
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic"],
    ],
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
              <p className="my-3">
                <span className="fw-bold">Patient Name: </span>
                {patientName}
              </p>
            </div>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">Session Date</p>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Activity/Assessment Plan</p>
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

              <div className="col">
                <p className="fw-bold mb-0">Session Recording</p>
                <input
                  type="text"
                  className="form-control"
                  value={sessionRecording}
                  onChange={(e) => setSessionRecording(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            className="col bg-white overflow-auto"
            style={{ maxHeight: "75vh" }}
          >
            <div className="container text-center">
              <div className="row">
                <div className="col mb-3">
                  <p className="fw-bold mb-0">Subjective</p>
                  <ReactQuill
                    value={subjective}
                    onChange={setSubjective}
                    modules={modules}
                    className="overflow-auto"
                    style={{ maxHeight: "90px" }}
                  />
                </div>
              </div>
            </div>

            <div className="container text-center">
              <div className="row overflow-auto" style={{ maxHeight: "130px" }}>
                <div className="col mb-3">
                  <p className="fw-bold mb-0">Objective/Goals</p>
                  <ReactQuill
                    value={objective}
                    onChange={setObjective}
                    modules={modules}
                  />
                </div>

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
                    className="overflow-auto"
                    style={{ maxHeight: "70px" }}
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
            >
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
