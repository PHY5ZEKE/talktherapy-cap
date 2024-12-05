import React from "react";

export default function ConfirmReschedule({
  closeModal,
  openResched,
  appointment,
}) {
  const handleResched = () => {
    closeModal();
    openResched();
  };

  const clinicianName = `${appointment.selectedClinician?.firstName} ${appointment.selectedClinician?.middleName} ${appointment.selectedClinician?.lastName}`;

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">
              Are you sure you want to change schedule?
            </h3>
            <p className="mb-0">
              The requested schedule will be subject for approval. This will
              also forfeit your current schedule when Rejected
            </p>
            <p>Please verify your transaction before proceeding.</p>
          </div>

          <div className="container text-center">
            <div className="row">
              <div className="col mb-3">
                <p className="fw-bold mb-0">Date</p>
                <p>{appointment?.selectedSchedule?.day}</p>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Time</p>
                <p>
                  {appointment?.selectedSchedule?.startTime} -{" "}
                  {appointment?.selectedSchedule?.endTime}
                </p>
              </div>

              <div className="col">
                <p className="fw-bold mb-0">Clinician</p>
                <p>{clinicianName || "NA"}</p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button onClick={handleResched} className="text-button border">
              <p className="fw-bold my-0">Reschedule</p>
            </button>
            <button onClick={closeModal} className="text-button-red border">
              <p className="fw-bold my-0">Cancel</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
