import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./modal.css";

export default function EditContent({ closeModal, onSubmit, content }) {
  // Initialize form state with existing content data
  const [name, setName] = useState(content.name || "");
  const [description, setDescription] = useState(content.description || "");
  const [category, setCategory] = useState(content.category || "");
  const [image, setImage] = useState(null); // Optional new image
  const [videoUrl, setVideoUrl] = useState(content.videoUrl || ""); // Optional video URL

  const handleChange = (value) => {
    setDescription(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("videoUrl", videoUrl); // Add videoUrl if provided
    if (image) formData.append("image", image); // Add new image if uploaded

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("Submitting form data:", { name, description, category, image, videoUrl });

    try {
      await onSubmit(content._id, formData); // Pass formData to parent
      closeModal();
      toast.success("Content updated successfully!");
    } catch (error) {
      console.error("Failed to update content:", error);
      toast.error("Failed to update content");
    }
  };

  // Handle file selection for new image
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle video URL input
  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };

  // Callback function to close modal
  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-bold">Edit Content</h3>
        <p>Edit the fields below to update the content.</p>

        <div className="container row text-center">
          <div className="col">
            <div className="form-group">
              <label className="mb-0">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter content name"
              />
            </div>

            <div className="form-group">
              <label className="mb-0">Description</label>
              <div className="quill-editor">
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
                  ]}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="mb-0">Category</label>
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
              <label className="mb-0">Video URL (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={videoUrl}
                onChange={handleVideoUrlChange}
                placeholder="Enter video URL (optional)"
              />
            </div>

            <div className="form-group">
              <label className="mb-0">Upload New Image (Optional)</label>
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
          <button onClick={handleSubmit} className="btn btn-primary">
            <p className="fw-bold my-0">UPDATE</p>
          </button>
          <button onClick={handleClose} className="btn btn-secondary">
            <p className="fw-bold my-0">CANCEL</p>
          </button>
        </div>
      </div>
    </div>
  );
}
