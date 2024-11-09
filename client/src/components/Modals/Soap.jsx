import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import "./modal.css";

import { route } from "../../utils/route";
import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

export default function Soap({
  openModal,
  clinicianId,
  clinicianName,
  patientId,
  onWebSocket,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [date, setDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
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
      diagnosis,
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
        show_to: [patientId],
      };
      
      notify("SOAP diagnosis created successfully");
      onWebSocket(userUpdate);

      openModal(); // Close the modal after successful submission
    } catch (error) {
      failNotify("Failed to create SOAP diagnosis");
    }
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
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Attending Clinician</p>
                <p>Dr. {clinicianName}</p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <form className="container w-100" onSubmit={handleSubmit}>
              <p className="fw-bold text-center mb-1">Diagnosis</p>
              <textarea
                className="form-control"
                aria-label="With textarea"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              ></textarea>
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
