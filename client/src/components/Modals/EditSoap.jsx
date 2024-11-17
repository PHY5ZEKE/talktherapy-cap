import { useState, useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { AuthContext } from "../../utils/AuthContext";
import "./modal.css";
import { route } from "../../utils/route";
import { toast, Slide } from "react-toastify";

export default function EditSoap({ openModal, soapRecord, onFetch }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Format as dd/mm/yyyy
  };

  const [date, setDate] = useState(soapRecord.date);
  const [activityPlan, setActivityPlan] = useState(soapRecord.activityPlan);
  const [sessionType, setSessionType] = useState(soapRecord.sessionType);
  const [subjective, setSubjective] = useState(soapRecord.subjective);
  const [objective, setObjective] = useState(soapRecord.objective);
  const [assessment, setAssessment] = useState(soapRecord.assessment);
  const [recommendation, setRecommendation] = useState(
    soapRecord.recommendation
  );

  const appURL = import.meta.env.VITE_APP_URL;

  const handleClose = (e) => {
    e.preventDefault();
    openModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const updatedSoapData = {
      date,
      activityPlan,
      sessionType,
      subjective,
      objective,
      assessment,
      recommendation,
    };

    try {
      const response = await fetch(
        `${appURL}/${route.soap.update}/${soapRecord._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedSoapData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server response:", errorData); // Log the server response
        throw new Error("Failed to update SOAP record");
      }

      const data = await response.json();
      onFetch();
      notify("Edited SOAP successfully.");
      openModal(); // Close the modal after successful submission
    } catch (error) {
      failNotify("Failed to edit SOAP.");
      console.log(error);
    }
  };

  const modules = {
    toolbar: false,
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Edit SOAP Record</h3>
            <p className="mb-0">Please verify your inputs before proceeding.</p>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">
                  Date: {formatDate(soapRecord.date)}
                </p>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Attending Clinician</p>
                <p>
                  Dr. {soapRecord.clinician.firstName}{" "}
                  {soapRecord.clinician.lastName}
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <form className="container w-100" onSubmit={handleSubmit}>
              <div className="container text-center">
                <div className="row">
                  <div className="col mb-3">
                    <p className="fw-bold mb-0">Activity Plan</p>
                    <ReactQuill
                      value={activityPlan}
                      onChange={setActivityPlan}
                      modules={modules}
                      className="overflow-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="container text-center">
                <div className="row">
                  <div className="col mb-3">
                    <p className="fw-bold mb-0">Session Type</p>
                    <ReactQuill
                      value={sessionType}
                      onChange={setSessionType}
                      modules={modules}
                      className="overflow-auto"
                    />
                  </div>
                </div>
              </div>

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
                <div className="row">
                  <div className="col mb-3">
                    <p className="fw-bold mb-0">Objective/Goals</p>
                    <ReactQuill
                      value={objective}
                      onChange={setObjective}
                      modules={modules}
                      className="overflow-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="container text-center">
                <div className="row">
                  <div className="col mb-3">
                    <p className="fw-bold mb-0">Assessment</p>
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
                    <p className="fw-bold mb-0">Recommendation</p>
                    <ReactQuill
                      value={recommendation}
                      onChange={setRecommendation}
                      modules={modules}
                      className="overflow-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center mt-3 gap-3">
                <button type="submit" className="text-button border">
                  <p className="fw-bold my-0 status">SUBMIT</p>
                </button>
                <button className="text-button border" onClick={handleClose}>
                  <p className="fw-bold my-0 status">CANCEL</p>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
