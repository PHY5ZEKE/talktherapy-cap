import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";
import AddComment from "./AddComment";

export default function ViewRecord({
  header,
  details,
  onDelete,
  onEdit,
  role,
}) {
  // Confirmation Dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const handleConfirmationDialog = () => {
    setIsConfirmationOpen((prevState) => !prevState);
  };

  // Add Comment Modal
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const handleCommentModal = () => {
    setIsCommentModalOpen((prevState) => !prevState);
  };

  // Add css to p tags
  const addClassToParagraphs = (htmlString) => {
    const div = document.createElement("div");
    div.innerHTML = htmlString;
    const paragraphs = div.querySelectorAll("p");
    paragraphs.forEach((p) => p.classList.add("mb-0"));
    return div.innerHTML;
  };

  // Check if data has html tag or not then render it properly
  const renderContent = (content) => {
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(content);
    if (hasHtmlTags) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: addClassToParagraphs(content),
          }}
        />
      );
    }
    return <div>{content}</div>;
  };

  return (
    <>
      {/* CONFIRMATION DIALOG */}
      {isConfirmationOpen && (
        <ConfirmationDialog
          header={"Delete this SOAP?"}
          body={"Please verify your action."}
          whatAction={"delete"}
          handleModal={handleConfirmationDialog}
          confirm={onDelete}
        />
      )}

      {/* ADD COMMENT MODAL */}
      {isCommentModalOpen && (
        <AddComment handleModal={handleCommentModal} recordId={details._id} />
      )}

      <details className="accordion mb-3 border border rounded-3">
        <summary className="open:bg-danger p-3 rounded-top-3">{header}</summary>

        <div className="px-3 mt-3">
          <p>
            <strong>Date:</strong> {new Date(details.date).toLocaleDateString()}
          </p>
          <div>
            <strong>Activity Plan:</strong> {renderContent(details.activityPlan)}
          </div>
          <div>
            <strong>Session Type:</strong> {renderContent(details.sessionType)}
          </div>
          <div>
            <strong>Subjective:</strong> {renderContent(details.subjective)}
          </div>
          <div>
            <strong>Objective:</strong> {renderContent(details.objective)}
          </div>
          <div>
            <strong>Assessment:</strong> {renderContent(details.assessment)}
          </div>
          <div>
            <strong>Recommendation:</strong> {renderContent(details.recommendation)}
          </div>
          <div>
            <strong>Comment From Admin:</strong> {renderContent(details.comment)}
          </div>
        </div>

        {role === "admin" ? (
          <div className="d-flex gap-3 m-3 border border-bottom-0 border-start-0 border-end-0">
            <p
              className="fw-bold mt-3 mb-0 text-button border"
              onClick={handleCommentModal}
            >
              Comment
            </p>
          </div>
        ) : (
          <div className="d-flex gap-3 m-3 border border-bottom-0 border-start-0 border-end-0">
            <p
              className="fw-bold mt-3 mb-0 text-button border"
              onClick={onEdit}
            >
              Edit
            </p>
            <p
              className="fw-bold mt-3 mb-0 text-button border"
              onClick={handleConfirmationDialog}
            >
              Delete
            </p>
          </div>
        )}
      </details>
    </>
  );
}
