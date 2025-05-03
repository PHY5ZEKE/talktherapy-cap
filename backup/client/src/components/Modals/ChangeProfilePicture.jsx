import { useState, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { toast, Slide } from "react-toastify";
import { toastMessage } from "../../utils/toastHandler";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function ChangeProfilePicture({
  editPictureAPI,
  closeModal,
  onFetch,
}) {
  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [profilePicture, setProfilePicture] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const appURL = import.meta.env.VITE_APP_URL;

  // Change Profile Picture Listener
  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  // Upload Profile Picture Listener
  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      failNotify("Select an image for profile picture upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      setIsSubmitting(true);
      const response = await fetch(`${appURL}/${editPictureAPI}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      setIsSubmitting(false);
      if (response.ok) {
        notify(toastMessage.success.edit);
        onFetch();
        closeModal();
      } else {
        failNotify(
          "Invalid Upload. File limit is 5MB and only JPEG, JPG, and PNG are allowed."
        );
      }
    } catch (error) {
      failNotify(toastMessage.fail.error);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={closeModal} className="p-3" centered>
      <Modal.Header>
        <Modal.Title>Change Profile Picture</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-group d-flex flex-column mb-3">
          <p className="mb-0">
            Upload Profile Picture <span className="text-required">*</span>
          </p>
          <input
            type="file"
            className="form-control"
            onChange={handleProfilePictureChange}
          />
          <button
            type="button"
            className="text-button fw-bold border w-100 mt-3"
            onClick={handleProfilePictureUpload}
          >
            Upload Picture
          </button>
          <small className="form-text text-muted">
            Accepted file formats: JPG, JPEG, PNG <br />
          </small>
          <small className="form-text text-muted">File Size: 5 MB Limit</small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="text-button-red fw-bold" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
