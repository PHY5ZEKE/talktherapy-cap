import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route"; // Import the route

import { toastMessage } from "../../utils/toastHandler";
import { toast, Slide } from "react-toastify";

export default function AddComment({ handleModal, recordId }) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const appURL = import.meta.env.VITE_APP_URL;

  const [comment, setComment] = useState("");

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
    handleModal();
  };

  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment) {
      failNotify("Comment is required");
      return;
    }
    setIsDisabled(true);
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${appURL}/${route.soap.comment}/${recordId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      notify("Comment added successfully!");
      handleModal();
    } catch (error) {
      console.log(error);
      failNotify("Failed to add comment. Try again.");
    } finally {
      setIsSubmitting(false);
      setIsDisabled(false);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-content-center">
        <div className="d-flex flex-column text-center">
          <h5 className="fw-bold">Add Comment</h5>
          <p className="mb-0">Please verify your inputs before proceeding.</p>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <p className="fw-bold mb-0 text-center">
                Enter your comment. <span className="text-required">*</span>
              </p>
              <textarea
                type="text"
                className="form-control"
                placeholder="Enter comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3 gap-3">
          <button
            className="text-button border fw-bold"
            style={{ cursor: "pointer" }}
            onClick={handleSubmit}
            disabled={isDisabled || isSubmitting}
          >
            {isSubmitting ? `Submitting` : `Submit`}
          </button>
          <button
            className="text-button-red border fw-bold"
            style={{ cursor: "pointer" }}
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
