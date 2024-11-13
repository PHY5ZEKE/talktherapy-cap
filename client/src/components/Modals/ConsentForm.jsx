import { useState, useRef, useEffect } from "react";

import "./modal.css";
import { Tooltip } from 'react-tooltip'

export default function ConsentForm({ handleModal }) {
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const contentRef = useRef(null);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      setIsScrolledToEnd(true);
    } else {
      setIsScrolledToEnd(false);
    }
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    contentElement.addEventListener('scroll', handleScroll);
    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const triggerModal = () => {
    handleModal();
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-content-center">
        <div
          ref={contentRef}
          className="col bg-white border rounded-4 p-3 overflow-auto"
          style={{ maxHeight: "75vh" }}
        >
          <h2>Evaluation & Therapy Sessions</h2>
          <h5>1. Patient Contact</h5>
          <p>
            That the student-in-charge and their respective academic and
            clinical supervisors have access to the client’s contact details. If
            and when the client changes contact details, it must be reported to
            the current academic student-in-charge immediately.
          </p>

          <h5>2. Laboratory Entry</h5>
          <p>
            That you will be allowed entry in the UST SLP CSC Laboratory during
            your scheduled time slot. Upon arrival at Gate 10, the students will
            fetch you and will be escorted to your assigned room in the SLP
            laboratory. The parent should always be inside the room. Only one
            companion is allowed inside the SLP laboratory.
          </p>

          <h5>3. Patient Handling</h5>
          <p>
            That the assessment and intervention will be done by the
            student-in-charge, supervised by certified academic and clinical
            speech-language pathology supervisors at this center.
          </p>

          <h5>4. In-session Documentation</h5>
          <p>
            That sessions and any other activities related to the case will be
            recorded in audio and/or video formats. The recordings will be used
            in teaching, learning activities, and research purposes.
          </p>

          <h2>Assessment (and other) Documentation</h2>
          <h5>1. Purpose & Use</h5>
          <p>
            That documents pertaining to the course of assessment and treatment
            will be used for teaching, learning, and research purposes. Personal
            information obtained pertaining to the case will be held in strict
            confidentiality.
          </p>

          <h5>2. Data Storage</h5>
          <p>
            That the hard copy data of the client will be stored and can only be
            accessed by current students-in-charge and clinical supervisors in a
            secured room. Soft copy data will be stored in a Google Drive that
            can only be accessed by current students-in-charge and their current
            clinical supervisors. In-session recordings will be stored in a hard
            drive that can only be accessed by the current students-in-charge
            and their current clinical supervisors. Both hard and soft copy data
            will be kept until they are active as current clients of the center.
          </p>

          <h5>3. Data Disposal</h5>
          <p>
            That once the client is no longer an active member of the center,
            data will only be disposed of a year after their first session.
            Afterwards, these data will be disposed of through shredding (if
            hard copy) and deletion (if soft copy).
          </p>

          <h2>Attendance</h2>
          <h5>1. Attendance</h5>
          <p>
            That failure to inform the center or its representatives of
            tardiness or absence from a session twice (2 sessions consecutive),
            will drop you from the deck and waitlist. Acquiring 2 informed
            absences (2 sessions consecutive, in a month) will likewise drop you
            from the deck. Lastly, inconsistent attendance (50% absences or more
            in a 2-month period) throughout the program will likewise drop you
            from the deck.
          </p>

          <h5>2. Rescheduling</h5>
          <p>
            Rescheduling of sessions is not allowed, except for emergency
            situations. This will be subject to the room availability and
            approval of the CSC service coordinator.
          </p>
        </div>

        <Tooltip
            anchorSelect=".text-button"
            place="top"
        >
            You can only proceed after reading the document.
        </Tooltip>
        
        <button
          type="button"
          onClick={triggerModal}
          className="mx-auto fw-bold my-0 mt-3 text-button border"
          disabled={!isScrolledToEnd}
        >
          BACK
        </button>
      </div>
    </div>
  );
}