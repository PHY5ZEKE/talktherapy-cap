import { useState, useRef, useEffect } from "react";

import "./modal.css";
import { Tooltip } from "react-tooltip";

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
    contentElement.addEventListener("scroll", handleScroll);
    return () => {
      contentElement.removeEventListener("scroll", handleScroll);
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
            Administrators and clinicians will have access to the client’s
            contact details. If and when the client changes contact details, it
            must be reported to the assigned clinician immediately.
          </p>
          <h5>2. Patient Handling</h5>
          <p>
            That the assessment and intervention will be done by the clinicians
            registered in the website
          </p>

          <h5>3. In-session Documentation</h5>
          <p>
            That SOAP templates will be used to document the sessions. These
            will be recorded in text. The recordings will be used in teaching,
            learning activities, and research purposes.
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
            That the soft copy data of the client will be stored and can only be
            accessed by current authorized personnel in the website, Soft copy
            data will be stored in MongoDB. Data will be kept until they are
            active as current clients of the center.
          </p>

          <h5>3. Account Disposal</h5>
          <p>
            That once the client is no longer an active member, data and access
            to the website will be disposed of after 3 months of inactivity in
            the website
          </p>

          <h2>Consent</h2>

          <p>
            By ticking the checkbox, you agree to the terms and conditions of
            the usage of TalkTherapy.
          </p>
        </div>

        <Tooltip anchorSelect=".text-button" place="top">
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
