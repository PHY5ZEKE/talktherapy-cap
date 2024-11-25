import { useState } from "react";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./modal.css";

export default function AddContent({ closeModal, onSubmit }) {
  // Callback Function to close modal
  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null); // New state for image file
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState(null);

  const handleChange = (value) => {
    setDescription(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (!name || !description || !category || !image) {
      toast.error("All fields are required");
      return; // Prevent form submission if any field is missing
    }

    // Validate name (must not exceed 250 characters)
    if (name.length > 250) {
      toast.error("Name must not exceed 250 characters");
      return;
    }

    // Validate video URL (must be a valid URL)
    const urlRegex = /^(https?|chrome|www):\/\/[^\s$.?#].[^\s]*$/;
    if (videoUrl && !urlRegex.test(videoUrl)) {
      toast.error("Invalid video URL format");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("videoUrl", videoUrl);
    if (image) formData.append("image", image); // Add image file if available

    try {
      await onSubmit(formData); // Pass the formData to the parent component
      setName("");
      setDescription("");
      setCategory("");
      setVideoUrl("");
      setImage(null); // Reset image input
      closeModal();
    } catch (error) {
      setError(error.message);
      toast.error("Failed to add content");
    }
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 1 * 1024 * 1024) {
      // Check if file size exceeds 5 MB
      toast.error("Image must not exceed 5 MB");
      setImage(null); // Reset image input
      return;
    }
    setImage(file);
  };

  const modules = {
    toolbar: false,
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-bold">Add Content</h3>
        <p>Please fill up the form accordingly.</p>

        <div className="container row text-center">
          <div className="col">
            <div className="form-group">
              <label className="mb-0 fw-bold">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter content name"
              />
            </div>

            <div className="form-group">
              <label className="mb-0 fw-bold">Description</label>
              <div className="quill-editor" style={{ maxHeight: "300px" }}>
                <ReactQuill
                  value={description}
                  onChange={handleChange}
                  placeholder="Enter content description"
                  theme="snow" // theme of the editor
                  modules={{
                    toolbar: [
                      [{ header: "1" }, { header: "2" }, { font: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["bold", "italic", "underline"],
                      ["link"],
                      ["blockquote", "code-block"],
                      [{ align: [] }],
                      [{ size: ["small", "medium", "large", "huge"] }],
                      [{ color: [] }, { background: [] }],
                      ["image"],
                      ["clean"], // for clearing the formatting
                    ],
                  }}
                  formats={[
                    "header",
                    "font",
                    "list",
                    "bold",
                    "italic",
                    "underline",
                    "align",
                    "link",
                    "blockquote",
                    "code-block",
                    "image",
                    "size",
                    "color",
                    "background",
                  ]}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="mb-0 fw-bold">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Children">Children</option>
                <option value="Adult">Adult</option>
              </select>
            </div>

            <div className="form-group">
              <label className="mb-0 fw-bold">Video URL (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL (optional)"
              />
            </div>

            <div className="form-group">
              <label className="mb-0 fw-bold">Upload Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3 gap-3">
          <button onClick={handleSubmit} className="text-button border">
            <p className="fw-bold my-0">SUBMIT</p>
          </button>
          <button onClick={handleClose} className="text-button border">
            <p className="fw-bold my-0">CANCEL</p>
          </button>
        </div>
      </div>
    </div>
  );
}
